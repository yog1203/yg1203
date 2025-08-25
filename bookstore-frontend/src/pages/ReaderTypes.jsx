import CrudPage from '../components/CrudPage'
export default function ReaderTypes(){
  return (
    <CrudPage title="Reader Types" listPath="/api/reader_types"
      columns={[{key:'name',label:'Type Name',required:true}]}
      initialForm={{name:''}}
      toPayload={f=>f} />
  )
}
