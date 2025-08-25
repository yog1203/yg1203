import CrudPage from '../components/CrudPage'
export default function Users(){
  return (
    <CrudPage title="User Master" listPath="/api/users"
      columns={[
        {key:'email',label:'Email',required:true},
        {key:'password',label:'Password',required:true},
        {key:'name',label:'Name',required:true},
        {key:'role',label:'Role',required:true}
      ]}
      initialForm={{email:'',password:'',name:'',role:'user'}}
      toPayload={f=>f} />
  )
}
