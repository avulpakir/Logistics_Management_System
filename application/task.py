from celery import shared_task
import time,datetime
from .models import User,Transaction
import csv
from .utilities import format_report
from .mail import send_email
import requests

@shared_task(ignore_results=False,name="download_csv_report")
def csv_report():
    users=User.query.all()
    transactions=Transaction.query.all()
    csv_file_name = f"transaction_{datetime.datetime.now().strftime('%f')}.csv"
    with open(f'static/{csv_file_name}','w',newline="") as csvfile:
        sr_no=1
        trans_csv=csv.writer(csvfile,delimiter=",")
        trans_csv.writerow(['Sr No.','Transaction Name','Type','Created at','Delivery Date','Source','Destination','Internal Status','Delivery Status','Amount','Username'])
        for t in transactions:
            this_trans=[sr_no,t.name,t.type,t.date,t.delivery,t.source,t.destination,t.internal_status,t.delivery_status,t.amount,t.bearer.username]
            trans_csv.writerow(this_trans)
            sr_no+=1
    
    return csv_file_name

    
    

@shared_task(ignore_results=False,name="monthly_report")
def monthly_report():
    users=User.query.all()
    for user in users[1:]:
        user_data={}
        user_data['username']=user.username
        user_data['email']=user.email
        user_trans=[]
        for transaction in user.trans:
            this_trans={}
            this_trans["id"]=transaction.id
            this_trans["name"]=transaction.name
            this_trans["type"]=transaction.type
            #this_trans["date"]=transaction.date
            

            this_trans["source"]=transaction.source
            this_trans["delivery"]=transaction.delivery
            this_trans["destination"]=transaction.destination
            #this_trans["internal_status"]=transaction.internal_status
            #this_trans["delivery_status"]=transaction.delivery_status
            #this_trans["description"]=transaction.description
            this_trans["amount"]=transaction.amount
            this_trans["user"]=transaction.bearer.username
            user_trans.append(this_trans)
        user_data['transactions']=user_trans
        message=format_report('templates/mail_details.html',user_data)
        send_email(user.email,subject="Monthly Report",message=message)

    return "Montly Reports Sent"

@shared_task(ignore_results=False,name="delivery_update")
def delivery_report(username):
    text = f"Hi {username}, your delivery status has been updated. Please check the app at http://127.0.0.1:5000"
    response = requests.post("#GOOGLE WEBHOOK FOR GOOGLE POSTS", json = {"text": text})
    #print(response.status_code)
    print(response.json())
    return "The delivery is sent to user"
    
