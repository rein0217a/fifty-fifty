import type { NextPage, GetStaticProps } from 'next'
import Layout from '../components/Layout'
import CSVUpload from '../components/CSVUpload'

type Props = {
  data: {name:string}
}

const Upload = ({data}: Props) => {
  console.log('Upload')
  return (
    <Layout>
      <CSVUpload />
      {/* {data.name} */}
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  // 外部のAPIエンドポイントを呼び出してpostsを取得します。
  // 任意のデータ取得ライブラリを使用できます。
  const res = await fetch('http://localhost:4000/api/hello');
  const data = await res.json();
  console.log('getStaticProps')
  return {
    props: {
      data
    }
  };
}

export default Upload
