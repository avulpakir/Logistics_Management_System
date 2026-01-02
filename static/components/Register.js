export default{
    template:`
    <div class="row border">
    <div class="col" style="height: 750px;">
        
<div>
    <h2 class="text-center">Register Form</h2>
    <div>
        <label for="username">Enter your username</label>
        <input type="text" id="username" v-model="formData.username">
    </div>
    <div>
        <label for="email">Enter you Email</label>
        <input type="text" id="email" v-model="formData.email">
    </div>
    <div>
        <label for="pass">Enter you Password</label>
        <input type="password" id="pass" v-model="formData.password">
    </div>
    <div>
        <button class="btn btn-primary" @click="addUser">Register</button>
    </div>
</div>
    </div>
</div>
    `,
    data: function() {
        return {
            formData:{
                email:"",
                password:"",
                username:""
            }
        }
      
    },
    methods:{
        addUser:function(){
            fetch('/api/register',{
                method:'POST',
                headers:{
                    "Content-Type":'application/json'
                },
                body:JSON.stringify(this.formData)//the content goest o backend as json string
            })
            .then(response=>response.json())
            .then(data=>{
                alert(data.messages)
                this.$router.push('/login')
            })
        }
    }
}