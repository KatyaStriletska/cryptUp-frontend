import { FC, useCallback, useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../hooks/redux.hooks';
import {
  selectChats,
  selectChatsUnreadMessagesCount,
  selectSocket,
  setChats,
  setChatsUnreadMessagesCount,
  setSocket,
  updateChat,
} from '../../redux/slices/chat.slice';
import { useAuth } from '../../hooks/auth.hooks';
import { fetchUser, setUser } from '../../redux/slices/user.slice';
import { resolveImage } from '../../utils/file.utils';
import { AppRoutes } from '../../types/enums/app-routes.enum';
import { Link } from 'react-router-dom';
import { ArchiveIcon, StarIcon } from '../../components/atoms/Icons/Icons';
import { io } from 'socket.io-client';
import { selectMessages } from '../../redux/slices/message.slice';
import { Chat } from '../../types/chat.types';
import Spinner from '../../components/atoms/Spinner/Spinner';
import Title from 'components/atoms/Title';
import TextInput from 'components/atoms/TextInput';

type MessageCenterPageFilters = 'all' | 'favourite' | 'archived';

const MessageCenterPage: FC = () => {
  const chats = useAppSelector(selectChats);
  const socket = useAppSelector(selectSocket);
  const messages = useAppSelector(selectMessages);
  const chatsUnreadMessagesCount = useAppSelector(selectChatsUnreadMessagesCount);
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState<string>('');
  const [displayedChats, setDisplayedChats] = useState<Chat[]>([]);
  const [hasUserJoinedChats, setHasUserJoinedChats] = useState(false);
  const [hasChatListLoaded, setHasChatListLoaded] = useState(false);
  const [filters, setFilters] = useState<MessageCenterPageFilters>('all');
  const { authenticatedUser } = useAuth();
  const { id } = useParams();

  const formatDate = useCallback((date: Date) => {
    switch (true) {
      case Math.abs(new Date().getTime() - date.getTime()) < 1000 * 60 * 60 * 24:
        return new Intl.DateTimeFormat('en-US', { timeStyle: 'short' }).format(date);
      case Math.abs(new Date().getTime() - date.getTime()) < 1000 * 60 * 60 * 24 * 2:
        return 'Yesterday';
      case Math.abs(new Date().getTime() - date.getTime()) < 1000 * 60 * 60 * 24 * 7:
        return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
      default:
        return new Intl.DateTimeFormat('en-US', { dateStyle: 'short' }).format(date);
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    setDisplayedChats(chats);

    if (search.trim()) {
      setDisplayedChats(
        chats.filter(chat => {
          const anotherChatMember = chat.usersToChat.find(
            userToChat => userToChat.userId !== authenticatedUser?.id,
          )?.user;
          const chatName =
            chat.name ||
            `${anotherChatMember?.username} ${anotherChatMember?.firstName && anotherChatMember?.lastName ? `(${anotherChatMember?.firstName} ${anotherChatMember?.lastName})` : ``}`;

          return chatName.toLowerCase().includes(search.toLowerCase());
        }),
      );
    }

    if (filters === 'archived') {
      setDisplayedChats(
        chats.filter(chat => chat.archivedBy.find(user => user.id === authenticatedUser?.id)),
      );
    }

    if (filters === 'favourite') {
      setDisplayedChats(
        chats.filter(chat => chat.favouriteFor.find(user => user.id === authenticatedUser?.id)),
      );
    }
  }, [chats, search, filters]);

  useEffect(() => {
    if (!hasChatListLoaded) {
      dispatch(setChats([]));
      dispatch(setChatsUnreadMessagesCount({}));
    }

    if (authenticatedUser && !hasChatListLoaded) {
      dispatch(
        fetchUser(
          authenticatedUser.id,
          {
            where: {
              userToChats: {
                chat: {
                  messages: { removedAt: null },
                },
              },
            },
            relations: {
              userToChats: {
                chat: {
                  archivedBy: true,
                  favouriteFor: true,
                  usersToChat: { user: true },
                  messages: { seenBy: true, author: true },
                },
              },
            },
            order: { userToChats: { chat: { messages: { createdAt: 'DESC' } } } },
          },
          {
            onSuccess: data => {
              dispatch(
                setChatsUnreadMessagesCount(
                  data.userToChats.reduce((previousValue: any, currentValue: any) => {
                    previousValue[currentValue.chat.id] = currentValue.chat.messages.filter(
                      (message: any) =>
                        !message.seenBy?.find((user: any) => user.id === authenticatedUser.id) &&
                        message.author.id !== authenticatedUser.id,
                    ).length;

                    return previousValue;
                  }, {}),
                ),
              );
              dispatch(
                setChats(
                  data.userToChats
                    .map((userToChat: any) => userToChat.chat)
                    .sort(
                      (chatA: any, chatB: any) =>
                        new Date(chatB.messages[0]?.createdAt || chatB.createdAt).getTime() -
                        new Date(chatA.messages[0]?.createdAt || chatA.createdAt).getTime(),
                    ),
                ),
              );
              dispatch(setUser(null));
              setHasChatListLoaded(true);
            },
          },
        ),
      );
    }
  }, [authenticatedUser, hasChatListLoaded]);

  useEffect(() => {
    dispatch(
      setSocket(
        io(`${import.meta.env.VITE_BACKEND_URI}`, {
          path: '/api/socket.io',
        }),
      ),
    );

    return () => {
      dispatch(setSocket(null));
    };
  }, [dispatch]);

  useEffect(() => {
    if (socket && !hasUserJoinedChats && chats.length > 0) {
      chats.forEach(chat => {
        socket.emit('join-chat', chat.id);
      });
      setHasUserJoinedChats(true);
    }
  }, [socket, chats]);

  useEffect(() => {
    if (socket) {
      socket.on('receive-message', payload => {
        if (payload.author.id !== authenticatedUser?.id) {
          const chatsUnreadMessagesCountCopy = structuredClone(chatsUnreadMessagesCount);
          chatsUnreadMessagesCountCopy[payload.chat?.id]++;
          dispatch(setChatsUnreadMessagesCount(chatsUnreadMessagesCountCopy));
        }
        dispatch(
          setChats(
            chats
              .map(chat =>
                chat.id === payload.chat?.id
                  ? { ...chat, messages: [payload, ...chat.messages] }
                  : chat,
              )
              .sort(
                (chatA, chatB) =>
                  new Date(chatB.messages[0]?.createdAt || chatB.createdAt).getTime() -
                  new Date(chatA.messages[0]?.createdAt || chatA.createdAt).getTime(),
              ),
          ),
        );
      });

      socket.on('receive-updated-message', payload => {
        dispatch(
          setChats(
            chats
              .map(chat =>
                chat.id === payload.chat?.id
                  ? {
                      ...chat,
                      messages: chat.messages.map(m => (m.id === payload.id ? payload : m)),
                    }
                  : chat,
              )
              .sort(
                (chatA, chatB) =>
                  new Date(chatB.messages[0]?.createdAt || 0).getTime() -
                  new Date(chatA.messages[0]?.createdAt || 0).getTime(),
              ),
          ),
        );
      });

      socket.on('receive-removed-message', payload => {
        dispatch(
          setChats(
            chats
              .map(chat =>
                chat.id === payload.chat?.id
                  ? {
                      ...chat,
                      messages: chat.messages
                        .filter(m => m.id !== payload.id)
                        .map(m => (m.replyTo?.id === payload.id ? { ...m, replyTo: payload } : m)),
                    }
                  : chat,
              )
              .sort(
                (chatA, chatB) =>
                  new Date(chatB.messages[0]?.createdAt || chatB.createdAt).getTime() -
                  new Date(chatA.messages[0]?.createdAt || chatA.createdAt).getTime(),
              ),
          ),
        );
      });

      socket.on('receive-create-chat', payload => {
        if (authenticatedUser) {
          if (payload?.find((userToChat: any) => userToChat.userId === authenticatedUser.id)) {
            dispatch(
              fetchUser(
                authenticatedUser.id,
                {
                  where: {
                    userToChats: {
                      chat: {
                        messages: { removedAt: null },
                      },
                    },
                  },
                  relations: {
                    userToChats: {
                      chat: {
                        archivedBy: true,
                        favouriteFor: true,
                        usersToChat: { user: true },
                        messages: { seenBy: true, author: true },
                      },
                    },
                  },
                  order: { userToChats: { chat: { messages: { createdAt: 'DESC' } } } },
                },
                {
                  onSuccess: data => {
                    dispatch(
                      setChatsUnreadMessagesCount(
                        data.userToChats.reduce((previousValue: any, currentValue: any) => {
                          previousValue[currentValue.chat.id] = currentValue.chat.messages.filter(
                            (message: any) =>
                              !message.seenBy?.find(
                                (user: any) => user.id === authenticatedUser.id,
                              ) && message.author.id !== authenticatedUser.id,
                          ).length;

                          return previousValue;
                        }, {}),
                      ),
                    );
                    dispatch(
                      setChats(
                        data.userToChats
                          .map((userToChat: any) => userToChat.chat)
                          .sort(
                            (chatA: any, chatB: any) =>
                              new Date(chatB.messages[0]?.createdAt || chatB.createdAt).getTime() -
                              new Date(chatA.messages[0]?.createdAt || chatA.createdAt).getTime(),
                          ),
                      ),
                    );
                    dispatch(setUser(null));
                    setHasChatListLoaded(true);
                  },
                },
              ),
            );
          }
        }
      });
    }

    return () => {
      if (socket) {
        socket?.off('receive-create-chat');
        socket?.off('receive-message');
        socket?.off('receive-updated-message');
        socket?.off('receive-removed-message');
      }
    };
  }, [socket, messages, chats, chatsUnreadMessagesCount]);

  const handleArchive = (chat: Chat) => {
    if (authenticatedUser) {
      const formData = new FormData();
      formData.append(
        !chat.archivedBy.find(user => user.id === authenticatedUser.id)
          ? 'addArchivedBy[0][id]'
          : 'removeArchivedBy[0][id]',
        authenticatedUser.id,
      );
      dispatch(updateChat(chat.id, formData));
    }
  };

  const handleAddToFavourite = (chat: Chat) => {
    if (authenticatedUser) {
      const formData = new FormData();
      formData.append(
        !chat.favouriteFor.find(user => user.id === authenticatedUser.id)
          ? 'addFavouriteFor[0][id]'
          : 'removeFavouriteFor[0][id]',
        authenticatedUser.id,
      );
      dispatch(updateChat(chat.id, formData));
    }
  };

  return (
    <div className='flex flex-col py-5 px-6 flex-1 min-h-screen'>
      <Title>Message Center</Title>
      <div className='flex justify-between items-center mb-14'>
        <div className='flex gap-1 rounded-full p-2 bg-purple-dark text-white'>
          <span
            className={`font-medium px-5 py-1 rounded-full cursor-pointer transition-all duration-300 ${filters === 'all' ? 'bg-[#4f16b4]' : 'hover:bg-[#4f16b490]'}`}
            onClick={() => setFilters('all')}
          >
            All
          </span>
          <span
            className={`font-medium px-5 py-1 rounded-full cursor-pointer transition-all duration-300 ${filters === 'favourite' ? 'bg-[#4f16b4]' : 'hover:bg-[#4f16b490]'}`}
            onClick={() => setFilters('favourite')}
          >
            Favourite
          </span>
          <span
            className={`font-medium px-5 py-1 rounded-full cursor-pointer transition-all duration-300 ${filters === 'archived' ? 'bg-[#4f16b4]' : 'hover:bg-[#4f16b490]'}`}
            onClick={() => setFilters('archived')}
          >
            Archived
          </span>
        </div>
      </div>
      <div className='flex flex-1 relative'>
        <div className='grid grid-cols-[425px_1fr] gap-4 absolute top-0 left-0 right-0 bottom-0'>
          <div className='relative'>
            <div className='flex flex-col flex-1 pb-3 text-white bg-gradient-white-purple rounded-xl before:rounded-xl h-full absolute top-0 left-0 right-0 bottom-0'>
              {hasChatListLoaded ? (
                <>
                  <div className='flex p-3'>
                    <TextInput
                      type='text'
                      className='!p-1.5'
                      placeholder='Search...'
                      defaultValue={search}
                      onChange={event => setSearch(event.target.value || '')}
                    />
                  </div>
                  <div className='h-full w-full ps-3 rounded-xl flex flex-col gap-2 relative overflow-y-scroll with-scrollbar'>
                    {!displayedChats.length && (
                      <div className='flex flex-1 border-2 border-dashed border-stone-200 rounded-xl items-center justify-center'>
                        <span className='text-center text-gray-200'>
                          The list of chats is empty
                        </span>
                      </div>
                    )}
                    {displayedChats.map(chat => {
                      const anotherChatMember = chat.usersToChat.find(
                        userToChat => userToChat.userId !== authenticatedUser?.id,
                      )?.user;
                      const chatName =
                        chat.name ||
                        `${anotherChatMember?.username} ${anotherChatMember?.firstName && anotherChatMember?.lastName ? `(${anotherChatMember?.firstName} ${anotherChatMember?.lastName})` : ``}`;

                      return (
                        <Link
                          to={AppRoutes.DetailsChat.replace(':id', chat.id)}
                          key={chat.id}
                          className={`group/chat rounded-xl p-3 cursor-pointer grid grid-cols-[48px_1fr_auto] gap-3 hover:bg-stone-100 transition-all duration-300 ${chat.id === id ? 'bg-stone-100' : ''}`}
                        >
                          <span className='aspect-square relative'>
                            {chat.image || (!chat.isGroup && anotherChatMember?.avatar) ? (
                              <img
                                src={resolveImage((chat.image || anotherChatMember!.avatar)!)}
                                alt='Chat image'
                                className='w-[48px] rounded-full aspect-square object-cover'
                              />
                            ) : (
                              <span className='inline-flex items-center justify-center bg-stone-300 w-[48px] rounded-full aspect-square'>
                                <span className='text-xl font-bold text-stone-600'>
                                  {chatName[0].toUpperCase()}
                                </span>
                              </span>
                            )}
                            {chatsUnreadMessagesCount[chat.id] > 0 && (
                              <span className='bg-blue-500 min-w-[17px] text-center text-white font-semibold right-0 bottom-0 rounded-full px-1 absolute text-[11px]'>
                                {chatsUnreadMessagesCount[chat.id]}
                              </span>
                            )}
                          </span>
                          <span className='flex flex-col relative'>
                            <h3 className='font-sans font-semibold'>{chatName}</h3>
                            <span
                              className='text-sm mt-1'
                              style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {chat.messages[0]?.content || (
                                <span className='text-stone-400 italic'>
                                  No messages in the chat
                                </span>
                              )}
                            </span>
                          </span>
                          <span className='flex flex-col relative justify-between items-end'>
                            <span className='text-xs'>
                              {chat.messages[0]
                                ? formatDate(new Date(chat.messages[0].createdAt))
                                : ''}
                            </span>
                            <div className='flex gap-2'>
                              {!chat.archivedBy.find(user => user.id === authenticatedUser?.id) ? (
                                <button
                                  type='button'
                                  className='hidden group-hover/chat:inline'
                                  onClick={event => {
                                    handleArchive(chat);
                                    event.preventDefault();
                                  }}
                                >
                                  <ArchiveIcon className='size-5 hover:stroke-stone-500 transition-all duration-300' />
                                </button>
                              ) : (
                                <button
                                  type='button'
                                  onClick={event => {
                                    handleArchive(chat);
                                    event.preventDefault();
                                  }}
                                >
                                  <ArchiveIcon className='size-5 stroke-stone-500 transition-all duration-300' />
                                </button>
                              )}
                              {!chat.favouriteFor.find(
                                user => user.id === authenticatedUser?.id,
                              ) ? (
                                <button
                                  type='button'
                                  onClick={event => {
                                    handleAddToFavourite(chat);
                                    event.preventDefault();
                                  }}
                                >
                                  <StarIcon className='size-5 hover:fill-black transition-all duration-300' />
                                </button>
                              ) : (
                                <button
                                  type='button'
                                  onClick={event => {
                                    handleAddToFavourite(chat);
                                    event.preventDefault();
                                  }}
                                >
                                  <StarIcon className='size-5 fill-black transition-all duration-300' />
                                </button>
                              )}
                            </div>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className='flex flex-col items-center justify-center flex-1'>
                  <Spinner className='size-8' />
                  <span className='mt-2 font-mono text-gray-200 text-sm'>Loading</span>
                </div>
              )}
            </div>
          </div>
          <div className='flex flex-col bg-gradient-white-purple rounded-xl'>
            {!id && hasChatListLoaded && (
              <div className='flex flex-col flex-1 items-center justify-center rounded-xl m-3 border-2 border-dashed border-stone-200'>
                <span className='text-gray-200'>No chat has been opened</span>
              </div>
            )}
            {hasChatListLoaded ? (
              <Outlet />
            ) : (
              <div className='flex flex-col flex-1 items-center justify-center'>
                <Spinner className='size-8' />
                <span className='mt-2 text-gray-200 text-sm'>Loading</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageCenterPage;
