export default {
    props: ['loggedIn'],

    template: `
    <div>
        <h2 class="my-2">Update your transaction!</h2>

        <div class="row border" style="width: 50%; margin: auto;">
            <h2>Update Transaction</h2>

            <div class="mb-3">
                <label class="form-label">Transaction Name</label>
                <input type="text" class="form-control" v-model="transData.name">
            </div>

            <div class="mb-3">
                <label class="form-label">Transaction Type</label>
                <input type="text" class="form-control" v-model="transData.type">
            </div>

            <div class="d-flex">
                <div class="mb-3 mx-2">
                    <label class="form-label">Source City</label>
                    <select class="form-select" v-model="transData.source">
                        <option disabled value="">Select</option>
                        <option>Mumbai</option>
                        <option>Chennai</option>
                        <option>Delhi</option>
                    </select>
                </div>

                <div class="mb-3">
                    <label class="form-label">Destination City</label>
                    <select class="form-select" v-model="transData.destination">
                        <option disabled value="">Select</option>
                        <option>Mumbai</option>
                        <option>Chennai</option>
                        <option>Delhi</option>
                    </select>
                </div>
            </div>

            <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea class="form-control" rows="3" v-model="transData.desc"></textarea>
            </div>

            <div class="mb-3 text-end">
                <button @click="updateTrans" class="btn btn-primary">Save</button>
            </div>
        </div>
    </div>
    `,

    data() {
        return {
            id: null,
            transData: {
                name: '',
                type: '',
                source: '',
                destination: '',
                desc: ''
            }
        }
    },

    mounted() {
        this.id = this.$route.params.id
        this.loadTransaction()
    },

    methods: {

        // 1️⃣ Load existing transaction
        loadTransaction() {
            fetch(`/api/get/${this.id}`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                }
            })
            .then(res => res.json())
            .then(data => {
                this.transData.name = data.name
                this.transData.type = data.type
                this.transData.source = data.source
                this.transData.destination = data.destination
                this.transData.desc = data.description
            })
        },

     
        updateTrans() {
            if (this.transData.source === this.transData.destination) {
      alert("Source and Destination cannot be the same");
      return;
    }
            fetch(`/api/update/${this.id}`, {
                method: 'PUT',   
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                },
                body: JSON.stringify(this.transData)
            })
            .then(res => res.json())
            .then(() => {
                alert("Transaction updated successfully")
                this.$router.push('/dashboard') // go back to home
            })
        }
    }
}
