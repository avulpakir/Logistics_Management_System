export default {
template: `
<div class="container-fluid py-4" v-if="transactions">

    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="fw-bold">
            Welcome, <span class="text-primary">{{ userData.username }}</span>
        </h2>
        <button @click="csvExport" class="btn btn-outline-secondary">
            Download CSV
        </button>
    </div>

    <div class="row g-4">

        <!-- LEFT PANEL -->
        <div class="col-lg-7">

            <!-- Requested Transactions -->
            <div class="card shadow-sm mb-4">
                <div class="card-header bg-primary text-white">
                    Requested Transactions
                </div>
                <div class="card-body table-responsive" style="max-height:250px; overflow-y:auto;">
                    <table class="table table-hover align-middle">
                        <thead class="table-light">
                            <tr>
                                <th>ID</th>
                                <th>Package</th>
                                <th>Source</th>
                                <th>Destination</th>
                                <th>Date</th>
                                <th class="text-end">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="t in transactions" :key="t.id">
                                <tr v-if="t.internal_status === 'requested'">
                                    <td>{{ t.id }}</td>
                                    <td>{{ t.name }}</td>
                                    <td>{{ t.source }}</td>
                                    <td>{{ t.destination }}</td>
                                    <td>{{ t.date.substring(0,10) }}</td>
                                    <td class="text-end">
                                        <button @click="review(t)"
                                                class="btn btn-info btn-sm">
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Pending Transactions -->
            <div class="card shadow-sm mb-4">
                <div class="card-header bg-warning">
                    Pending Transactions
                </div>
                <div class="card-body table-responsive">
                    <table class="table table-hover align-middle">
                        <thead class="table-light">
                            <tr>
                                <th>ID</th>
                                <th>Package</th>
                                <th>Source</th>
                                <th>Destination</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th class="text-end">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="t in transactions" :key="'pending-' + t.id">
                                <tr v-if="t.internal_status === 'pending'">
                                    <td>{{ t.id }}</td>
                                    <td>{{ t.name }}</td>
                                    <td>{{ t.source }}</td>
                                    <td>{{ t.destination }}</td>
                                    <td>{{ t.date.substring(0,10) }}</td>
                                    <td>{{ t.amount }}</td>
                                    <td class="text-end">
                                        <button @click="() =>deleteTrans(t.id)" class="btn btn-danger btn-sm">Reject</button>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Paid Transactions -->
            <div class="card shadow-sm">
                <div class="card-header bg-success text-white">
                    Paid Transactions
                </div>
                <div class="card-body table-responsive">
                    <table class="table table-hover align-middle">
                        <thead class="table-light">
                            <tr>
                                <th>ID</th>
                                <th>Package</th>
                                <th>Source</th>
                                <th>Destination</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Update</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="t in transactions" :key="'paid-' + t.id">
                                <tr v-if="t.internal_status === 'paid'">
                                    <td>{{ t.id }}</td>
                                    <td>{{ t.name }}</td>
                                    <td>{{ t.source }}</td>
                                    <td>{{ t.destination }}</td>
                                    <td>{{ t.date.substring(0,10) }}</td>
                                
                                    <td>
                                        <span class="badge bg-info">
                                            {{ t.delivery_status }}
                                        </span>
                                    </td>
                                     <td class="d-flex">
                                <select class="form-select mx-2" style="width: 60%" v-model="delivery_status">
                                    <option selected>Open this select menu</option>
                                    <option value="in-process">In Process</option>
                                    <option value="in-transit">In Transit</option>
                                    <option value="dispatched">Dispatched</option>
                                    <option value="out-for-delivery">Out For Delivery</option>
                                    <option value="delivered">Delivered</option>
                                </select>
                                <button @click="() => updateDelivery(t.id)" class="btn btn-primary btn-sm">Save</button>
                            </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>

        <!-- RIGHT PANEL -->
        <div class="col-lg-5">
            <div class="card shadow-sm h-100">
                <div class="card-header bg-dark text-white">
                    Review Transaction
                </div>

                <div class="card-body" v-if="show_review">
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Package Name</label>
                        <p class="form-control-plaintext">{{ t.name }}</p>
                    </div>

                    <div class="mb-3">
                        <label class="form-label fw-semibold">Transaction Type</label>
                        <p class="form-control-plaintext">{{ t.type }}</p>
                    </div>

                    <div class="mb-3">
                        <label class="form-label fw-semibold">Route</label>
                        <p class="form-control-plaintext">
                            {{ t.source }} → {{ t.destination }}
                        </p>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Delivery Date</label>
                        <input type="date"
                               class="form-control"
                               v-model="t.delivery">
                    </div>

                    <div class="mb-4">
                        <label class="form-label">Amount</label>
                        <input type="number"
                               class="form-control"
                               v-model="t.amount">
                    </div>

                    <div class="text-end">
                        <button @click="save(t.id)"
                                class="btn btn-success">
                            Create
                        </button>
                    </div>
                </div>

                <div class="card-body text-muted text-center" v-else>
                    <p>Click on review button to review</p>
                </div>
            </div>
        </div>

    </div>
</div>
`,
    data(){
        return{
            userData:"",
            transactions:null,
            show_review:false,
            delivery_status:"",
            t:{
                name:'',
                type:'',
                source:'',
                destination:'',
                delivery:'',
                amount:''
            }
        }
    },
    mounted(){
        this.loadUser()
        this.loadTrans()
    },
    methods:{
        loadUser(){
                 fetch(`/api/home`,{
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
        .then(data=>this.transactions=data)
        },
        review(trans){
            this.show_review=true,
            this.t=trans

            
        },
        save(id) {
            fetch(`/api/review/${id}`, { // Use backticks here
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                },
                body: JSON.stringify(this.t)
            })
            .then(response => response.json())
            .then(data => { this.$router.push('/admin')})
             .then(data=>{
            this.loadTrans()})// go back to home; })
        },
        
        updateDelivery(id) {
            fetch(`/api/delivery/${id}`, { // Use backticks here
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                },
                body: JSON.stringify({
                    status: this.delivery_status
                })
            })
            .then(data => { this.$router.push('/admin')})
             .then(data=>{
            this.loadTrans()})// go back to home; })

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
                alert("Transaction Rejected successfully")
                this.$router.push('/admin')})

            .then(data=>{
            this.loadTrans()})// go back to home
            
        },
        csvExport(){
            fetch(`/api/export`)
            .then(response=>response.json())
            .then(data=>{
                window.location.href=`/api/csv_result/${data.id}`
                
            })
        }
    
    }}
