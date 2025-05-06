import Title from 'components/atoms/Title';
import { FC, useEffect } from 'react';


const AboutPage: FC = () => {

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className='flex flex-col p-6 items-center justify-center'>
      <div className='flex flex-col p-5 max-w-[1440px] rounded-md font-normal border-gradient-primary before:rounded-[20px]'>
        {/* <div style={{ overflowY: 'scroll' }} dangerouslySetInnerHTML={{ __html: Marked.parse(content) }}>
        </div> */}
        <div className="container mx-auto p-6 text-white">
          <section className="mb-10">
            <Title>Venture Launch</Title>

            <div style={{ display: 'flex', alignItems: 'center', columnGap: '10px' }}>
              <img src="https://img.shields.io/badge/build-0.1.0-brightgreen" alt="Build Badge" style={{ marginRight: '10px' }} />
              <a href="https://x.com/venture_launch" target="_blank" rel="noopener noreferrer">
                <img src="https://img.shields.io/badge/X-follow%20us-blue" alt="X Badge" />
              </a>
            </div>

            <p className="text-lg  leading-relaxed">
              In the ever-evolving landscape of startups, raising capital during the crucial pre-seed and seed stages can be a daunting challenge. Similarly, retail investors often struggle to find accessible opportunities to participate in these high-potential, early-stage investments. Enter Venture Launch, a platform designed to bridge this gap, empowering both startups and investors. By democratizing access to early-stage investments and pioneering liquid pre-markets, Venture Launch is set to transform the startup ecosystem.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-3xl font-semibold mb-4">Key Features</h2>

            <div className="mb-8">
              <h3 className="text-2xl font-medium mb-2">Accessible Investment Opportunities</h3>
              <p className="">
                VentureLaunch is committed to democratizing access to early-stage investments. Retail investors can easily participate in pre-seed and seed rounds through an intuitive user interface and streamlined onboarding process. This simplicity allows investors to explore and engage with startup opportunities effortlessly, leveling the playing field for those traditionally excluded from early-stage investments.
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-medium mb-2">Liquid Pre-Markets</h3>
              <p className="">
                One of VentureLaunch's most innovative features is the concept of liquid pre-markets. This allows startups to offer early liquidity options for investors, providing flexibility and exit strategies through cutting-edge financial instruments and market mechanisms. By enhancing liquidity for early-stage investments, VentureLaunch offers a unique value proposition for both startups and investors.
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-medium mb-2">Comprehensive Due Diligence</h3>
              <p className="">
                To ensure transparency and mitigate risks, VentureLaunch conducts thorough due diligence on participating startups. This includes comprehensive data analytics and expert evaluations, enabling investors to make informed decisions. The platform's rigorous approach to due diligence fosters trust and confidence in the investment process.
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-medium mb-2">Community Engagement</h3>
              <p className="">
                VentureLaunch is more than just a platform; it's a community. By fostering a vibrant network of entrepreneurs, investors, and industry experts, VentureLaunch facilitates collaboration and knowledge-sharing. Networking events, forums, and discussion boards encourage meaningful interactions and partnerships, enriching the overall experience for all participants.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-semibold mb-4">Technology Stack</h2>

            <div className="mb-8 flex items-center">
              <img src="https://cdn.iconscout.com/icon/free/png-256/node-js-1174925.png" alt="Node.js" className="w-12 h-12 mr-4 rounded-xl bg-white" />
              <div>
                <h3 className="text-2xl font-medium mb-2">Node.js</h3>
                <p className="">
                  Our backend is powered by Node.js, providing a fast and efficient runtime environment for building scalable network applications.
                </p>
              </div>
            </div>

            <div className="mb-8 flex items-center">
              <img src="https://cdn.iconscout.com/icon/free/png-256/postgresql-11-1175122.png" alt="PostgreSQL" className="w-12 h-12 mr-4 rounded-xl bg-white" />
              <div>
                <h3 className="text-2xl font-medium mb-2">PostgreSQL</h3>
                <p className="">
                  We use PostgreSQL as our relational database system, ensuring reliable and efficient data storage and retrieval.
                </p>
              </div>
            </div>

            <div className="mb-8 flex items-center">
              <img src="https://cdn.iconscout.com/icon/free/png-256/docker-226091.png" alt="Docker" className="w-12 h-12 mr-4 rounded-xl bg-white" />
              <div>
                <h3 className="text-2xl font-medium mb-2">Docker</h3>
                <p className="">
                  Docker is utilized for containerization, allowing us to package our application and its dependencies into a container, ensuring consistency across multiple environments.
                </p>
              </div>
            </div>

            <div className="mb-8 flex items-center">
              <img src="https://cdn.iconscout.com/icon/free/png-256/nginx-2-1174926.png" alt="Nginx" className="w-12 h-12 mr-4 rounded-xl bg-white" />
              <div>
                <h3 className="text-2xl font-medium mb-2">Nginx</h3>
                <p className="">
                  Nginx serves as our web server and reverse proxy, providing load balancing, security, and high performance.
                </p>
              </div>
            </div>

            <div className="mb-8 flex items-center">
              <img src="https://cdn.iconscout.com/icon/free/png-256/react-3-1175109.png" alt="React.js" className="w-12 h-12 mr-4 rounded-xl bg-white" />
              <div>
                <h3 className="text-2xl font-medium mb-2">React.js</h3>
                <p className="">
                  Our frontend is built with React.js, creating a dynamic and responsive user interface for our users.
                </p>
              </div>
            </div>

            <div className="mb-8 flex items-center">
              <img src="https://herve.beraud.io/images/blog/rabbitmq.png" alt="RabbitMQ" className="w-12 h-12 mr-4 rounded-xl" />
              <div>
                <h3 className="text-2xl font-medium mb-2">RabbitMQ</h3>
                <p className="">
                  RabbitMQ is employed for message brokering, enabling efficient communication between different parts of our system.
                </p>
              </div>
            </div>

            <div className="mb-8 flex items-center">
              <img src="https://avatars.githubusercontent.com/u/84348534?s=200&v=4" alt="Squads" className="w-12 h-12 mr-4 rounded-xl bg-white" />
              <div>
                <h3 className="text-2xl font-medium mb-2">Squads</h3>
                <p className="">
                  We use Squads for building and interacting with Decentralized Autonomous Organisations.
                </p>
              </div>
            </div>

            <div className="mb-8 flex items-center">
              <img src="https://coinlaunch.space/media/images/4/8/5/0/4850.sp3ow1.192x192.png" alt="Phantom Wallet" className="w-12 h-12 mr-4 rounded-xl" />
              <div>
                <h3 className="text-2xl font-medium mb-2">Phantom Wallet</h3>
                <p className="">
                  Phantom Wallet is integrated for secure and efficient handling of cryptocurrency transactions, ensuring the reliability and robustness of our platform's financial operations.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
