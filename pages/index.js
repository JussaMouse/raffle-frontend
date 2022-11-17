import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
// import ManualHeader from '../components/ManualHeader'
import Header from '../components/Header'
import RaffleEntrance from '../components/RaffleEntrance'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Smart Contract Raffle</title>
        <meta
          name='description'
          content='Our smart contract lottery'
        />
        <link
          rel='icon'
          href='/favicon.ico'
        />
      </Head>
      {/* <ManualHeader /> */}
      <Header />
      <RaffleEntrance />
    </div>
  )
}
