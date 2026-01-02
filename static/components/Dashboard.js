export default{
template: `
<div>
    <h2 class="my-2"> Welcome {{ userData.username?.toUpperCase() }}</h2>
<div class="row border">
    <div class="col-6 border" style="height: 750px; overflow-y: scroll;">
    <h2 class='my-2'>Your Transactions</h2>

    <div v-if="!Array.isArray(transactions) || transactions.length === 0"
     class="text-center my-3">
    <p>No transactions found.</p>
    </div>

    <div v-else v-for="t in transactions" :key="t.id" class="card mb-2">
        <div class="card-body">
            <h4 class="card-title">
               <p> {{ t.name }}
                 <span class="badge text-white bg-secondary">{{ t.type }}</span></p>
            </h4>
            <p class="card-text">Created at: {{ t.date.substring(0,16) }}</p>
            <p v-if="t.internal_status === 'paid'" class="card-text btn btn-success">Estimated Delivery: {{ t.delivery }}</p>
            <p v-if="t.internal_status === 'paid'" class="card-text btn btn-success">Delivery Status: {{ t.delivery_status }}</p>
            <p class="card-text">About: {{ t.description }}</p>
           
            <p class="card-text">From: {{ t.source }} to {{ t.destination }}</p>
            <p v-if="t.internal_status === 'pending'" class="card-text">
                <button btn-success>Estimated Delivery Date: {{ t.delivery }}</button><br>
                <button>Amount: Rs. {{ t.amount }}</button><br><br>
                <button @click="pay(t.id)" class="btn btn-success">Pay</button>
                <button @click="() =>deleteTrans(t.id)" class="btn btn-danger btn-sm">Reject</button>
            </p>
            <p v-if="t.internal_status === 'requested'" class="card-text">
                <router-link :to="{ name: 'update', params: { id: t.id } }" class="btn btn-warning">Update</router-link>
                <button @click="deleteTrans(t.id)" class="btn btn-danger">Delete</button>
            </p>
        </div>
    </div>
</div>

    <div class="col-6 border" style="height: 750px;">
        <h2>Create Transactions</h2>
        <div class="mb-3">
            <label for="name" class="form-label">Product Name</label>
            <input type="text" class="form-control" id="name" v-model="transData.name">
        </div>
        <div class="mb-3">
            <label for="type" class="form-label">Transaction Type</label>
            <input type="text" class="form-control" id="type" v-model="transData.type">
        </div>
        <div class="mb-3">
            <label for="desc" class="form-label">Description</label>
            <textarea class="form-control" id="desc" rows="3" v-model="transData.desc"></textarea>
        </div>
        <div class="d-flex">
        <div class="mb-3">
            <label for="source" class="form-label">Source City</label>
            <select class="form-select" aria-label="Default select example" v-model="transData.source">
                <option selected disabled value="">Select a source city</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Chennai">Chennai</option>
                <option value="Delhi">Delhi</option>
            </select>
        </div>
        <div class="mb-3">
            <label for="destination" class="form-label">Destination City</label>
            <select class="form-select" aria-label="Default select example" v-model="transData.destination">
                <option selected disabled value="">Select a destination city</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Chennai">Chennai</option>
                <option value="Delhi">Delhi</option>
            </select>
        </div>
        </div>
        <div class="mb-3 text-end">
            <button @click="confirmCreate" class="btn btn-primary">Create</button>
        </div>
    </div>
</div>
</div>
`,
    data:function(){
        return{
            userData:"",
            transactions:null,
            transData:{
                name:'',
                type:'',
                source:'',
                destination:'',
                desc:''
            }
        }
    },
    mounted(){
       this.loadUser()
       this.loadTrans()

    },
    methods:{
        confirmCreate() {
    const ok = confirm("Please check the details before confirming.\nDo you want to continue?");
    if (ok) {
      this.createTrans();
    }
  },
        createTrans(){
            if (this.transData.source === this.transData.destination) {
      alert("Source and Destination cannot be the same");
      return;
    }
            fetch('/api/create',{
                method:'POST',
                headers:{
                    "Content-Type":"application/json",
                    "Authentication-Token":localStorage.getItem("auth_token"),

                },
                body:JSON.stringify(this.transData)
            })
             .then(response=>response.json())
                .then(data=>{
            this.loadTrans()
        })
        },
        loadUser(){
                 fetch('/api/home',{
            method:'GET',
            headers:{
                "Content-Type":"application/json",
                "Authentication-Token":localStorage.getItem("auth_token")
            }
        })
        .then(response=>response.json())
        .then(data=>this.userData=data)
        },
        loadTrans(){

        fetch(`/api/get`,{
            method:'GET',
            headers:{
                "Content-Type":"application/json",
                 "Authentication-Token":localStorage.getItem("auth_token")
            }
        })
        .then(response=>response.json())
        .then(data=>{this.transactions=data})
        },
        pay(id){
            fetch(`/api/pay/${id}`,{
                method:'GET',
            headers:{
                "Content-Type":"application/json",
                 "Authentication-Token":localStorage.getItem("auth_token")
            }
                
            }
                
            )
            .then(response=>response.json())
            .then(() => {
                alert("Payment successfully")
                this.$router.push('/dashboard')})
            .then(data=>{
            this.loadTrans()})// 
            },
        deleteTrans(id) {
            
            fetch(`/api/delete/${id}`, {
                method: 'DELETE',   
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                },
                body: JSON.stringify(this.transData)
            })
            .then(res => res.json())
            .then(() => {
                alert("Transaction Deleted successfully")
                this.$router.push('/dashboard')})

            .then(data=>{
            this.loadTrans()})// go back to home
            
        }
        }
    }

 