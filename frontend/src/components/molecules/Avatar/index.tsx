// import { FC, useMemo } from 'react';
// import Avatar, { AvatarProps } from './Avatar';
// import IntlProvider from 'components/HOC/IntlProvider';
// import getMessages from './intl';
// import { useLanguage } from 'hooks/language.hooks';

// const AvatarProvider: FC<AvatarProps> = ({ ...props }) => {
//   const { appLanguage } = useLanguage();
//   const messages = useMemo(() => getMessages(appLanguage), [appLanguage]);

//   return (
//     <IntlProvider messages={messages}>
//       <Avatar {...props} />
//     </IntlProvider>
//   );
// };

// export default AvatarProvider;
export { default } from './Avatar';