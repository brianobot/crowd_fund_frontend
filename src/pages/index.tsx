import type { NextPage } from "next";
import Head from "next/head";
import { HomeView } from "../views";

const Home: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Brian Crowd Funding Dapp</title>
        <meta
          name="description"
          content="Solana powered crowd funding dapp"
        />
      </Head>
      <HomeView />
    </div>
  );
};

export default Home;
