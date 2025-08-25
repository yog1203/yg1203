import CrudPage from '../components/CrudPage'
export default function Distributors(){
  return (
    <CrudPage title="Distributor Master" listPath="/api/distributors"
      columns={[
        {key:'fname',label:'First Name',required:true},
        {key:'mname',label:'Middle Name'},
        {key:'lname',label:'Last Name',required:true},
        {key:'address',label:'Address'},
        {key:'mobile1',label:'Mobile 1',required:true},
        {key:'mobile2',label:'Mobile 2'},
        {key:'email',label:'Email'},
        {key:'location',label:'Location',required:true}
      ]}
      initialForm={{fname:'',mname:'',lname:'',address:'',mobile1:'',mobile2:'',email:'',location:''}}
      toPayload={f=>f} />
  )
}
