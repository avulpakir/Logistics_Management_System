from flask import current_app as app,jsonify,request,render_template,send_from_directory
from flask_security import login_user,auth_required,roles_required,current_user,hash_password,roles_accepted
from .database import db
from .models import *
from werkzeug.security import check_password_hash,generate_password_hash
from .utilities import roles_list
from celery.result import AsyncResult
from .task import csv_report,monthly_report,delivery_report

@app.route('/',methods=['GET'])
def home():
    return render_template('index.html')


@app.route('/api/admin')
@auth_required('token')
@roles_required('admin')
def admin_home():
    return jsonify({
        "message":"admin logged in successfully"
    
    })


@app.route('/api/home')
@auth_required('token')
@roles_accepted('user','admin')
def user_home():
    user=current_user
    return jsonify({
        "username":user.username,
        "email":user.email,
        "roles":roles_list(user.roles)
    })

@app.route('/api/login',methods=['POST'])
def user_login():
    body=request.get_json()
    email=body['email']
    password=body['password']
    #print(password)
  
    if not email:
        return jsonify({
            "message":"Email is Required!"
        }),400

    user=app.security.datastore.find_user(email=email)
    #print(user.password)
    if user:
        if check_password_hash(user.password,password):
           
            login_user(user)#session
            return jsonify({
                "id":user.id,
                "username":user.username,
                "auth-token":user.get_auth_token(),
                "roles":roles_list(user.roles)
            })
        else:
            return jsonify({
                "message":"Incorrect Password"
            }),400
    else:
        return jsonify({
            "message":"User Not Found"
        }),404


@app.route('/api/register',methods=['POST'])
def create_user():

    credentials=request.get_json()
    if not app.security.datastore.find_user(email=credentials["email"]):
        app.security.datastore.create_user(email=credentials['email'],
                                           username=credentials['username'],
                                           password=generate_password_hash(credentials['password']),
                                           roles=['user'])

        db.session.commit()
        return jsonify({
            "message":"User Created successfully"
        }),201

    return jsonify({
        "message":"User Already Exists!"
    }),400


@app.route('/api/pay/<int:trans_id>')
@auth_required('token')
@roles_accepted('user')
def payment(trans_id):
    trans=Transaction.query.get(trans_id)
  
    
    
    trans.internal_status='paid'
    db.session.commit()
    return jsonify({
      "message":"Payment Successful!"
    })


@app.route('/api/delivery/<int:trans_id>',methods=['POST'])
@auth_required('token')
@roles_required('admin')
def delivery(trans_id):
    body=request.get_json()
    trans=Transaction.query.get(trans_id)
    trans.delivery_status=body['status']
    db.session.commit()
    result=delivery_report.delay(trans.bearer.username)
    return jsonify({
        "message":"delivery status updated!"
    })

@app.route('/api/review/<int:trans_id>',methods=['POST'])
@auth_required('token')
@roles_required('admin')
def review(trans_id):
    body=request.get_json()
    trans=Transaction.query.get(trans_id)
    trans.delivery=body['delivery']
    trans.amount=body['amount']
    trans.internal_status="pending"
    db.session.commit()
    return {
        "message":"transaction reviewed!"
    }

@app.route('/api/export')
def export_csv():
    result=csv_report.delay()#async object
    return jsonify({
        "id":result.id,
        "result":result.result
    })


@app.route('/api/csv_result/<id>')
def csv_result(id):
    result=AsyncResult(id)
    return send_from_directory('static',result.result)


@app.route('/api/mail')
def send_reports():
    res=monthly_report.delay()
    return{
        "result":res.result
    }