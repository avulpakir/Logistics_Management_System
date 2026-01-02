import datetime
from flask_restful import Api,Resource,reqparse
from .models import *
from flask_security import auth_required, roles_required,roles_accepted,current_user
from .utilities import roles_list
from .task import delivery_report

api=Api()



parser=reqparse.RequestParser()

parser.add_argument('name')
parser.add_argument('type')
#parser.add_argument('date')
parser.add_argument('source')
parser.add_argument('destination')
parser.add_argument('desc')

class TransApi(Resource):

    # GET ALL or GET ONE
    @auth_required('token')
    @roles_accepted('user', 'admin')
    def get(self, trans_id=None):

        # GET single transaction
        if trans_id is not None:
            transaction = Transaction.query.get(trans_id)

            if not transaction:
                return {"message": "Transaction not found"}, 404

            if "admin" not in roles_list(current_user.roles) and \
               transaction.user_id != current_user.id:
                return {"message": "Unauthorized"}, 403

            return {
                "id": transaction.id,
                "name": transaction.name,
                "type": transaction.type,
                "date": transaction.date,
                "delivery": transaction.delivery,
                "source": transaction.source,
                "destination": transaction.destination,
                "internal_status": transaction.internal_status,
                "delivery_status": transaction.delivery_status,
                "description": transaction.description,
                "amount": transaction.amount,
                "user": transaction.bearer.username
            }

        # GET all transactions
        if "admin" in roles_list(current_user.roles):
            transactions = Transaction.query.all()
        else:
            transactions = current_user.trans

        result = []
        for transaction in transactions:
            result.append({
                "id": transaction.id,
                "name": transaction.name,
                "type": transaction.type,
                "date": transaction.date,
                "delivery": transaction.delivery,
                "source": transaction.source,
                "destination": transaction.destination,
                "internal_status": transaction.internal_status,
                "delivery_status": transaction.delivery_status,
                "description": transaction.description,
                "amount": transaction.amount,
                "user": transaction.bearer.username
            })

        return result if result else ({"message": "No Transaction found"}, 404)

    # CREATE
    @auth_required('token')
    @roles_required('user')
    def post(self):
        args = parser.parse_args()

        try:
            transaction = Transaction(
                name=args['name'],
                type=args['type'],
                date=datetime.datetime.now(),
                source=args['source'],
                destination=args['destination'],
                description=args['desc'],
                user_id=current_user.id
            )
            db.session.add(transaction)
            db.session.commit()

            return {"message": "Transaction created successfully"}, 201

        except Exception:
            return {"message": "One or more fields are missing"}, 400

    # UPDATE
    @auth_required('token')
    @roles_required('user')
    def put(self, trans_id):
        args = parser.parse_args()
        transaction = Transaction.query.get(trans_id)

        if not transaction:
            return {"message": "Transaction not found"}, 404

        if transaction.user_id != current_user.id:
            return {"message": "Unauthorized"}, 403

        transaction.name = args['name']
        transaction.type = args['type']
        transaction.source = args['source']
        transaction.destination = args['destination']
        transaction.description = args['desc']

        db.session.commit()

        return {"message": "Transaction updated successfully"}

    # DELETE
    @auth_required('token')
    @roles_accepted('user','admin')   
    def delete(self, trans_id):
        trans = Transaction.query.get(trans_id)
        if trans:
            result=delivery_report.delay(trans.bearer.username)
            db.session.delete(trans)
            db.session.commit()
            return {
                "message": "transaction deleted successfully!"
            }
        else:
            return {
                "message": "transaction not found!"
            }, 404
        
api.add_resource(TransApi,'/api/get', '/api/get/<int:trans_id>',   '/api/create','/api/update/<int:trans_id>','/api/delete/<int:trans_id>')
