from flask_restful import Resource, reqparse
from werkzeug.security import safe_str_cmp
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_refresh_token_required,
    get_jwt_identity,
    get_raw_jwt,
    jwt_required
)
from models.CardsModel import User as U
from models.CardsModel import Cards as c
from blacklist import BLACKLIST

_user_parser = reqparse.RequestParser()
_user_parser.add_argument('username',
                          type=str,
                          required=True,
                          help="This field cannot be blank."
                          )
_user_parser.add_argument('password',
                          type=str,
                          required=True,
                          help="This field cannot be blank."
                          )


class AddCards(Resource):
    def post(self):
        card_parser = reqparse.RequestParser()
        card_parser.add_argument('question', type=str)
        card_parser.add_argument('answer', type=str)
        card_parser.add_argument('course', type=str)
        card_parser.add_argument('owner_id', type=int)
        data = card_parser.parse_args()
        card = c(question=data['question'], answer=data['answer'], course=data['course'], owner_id=data['owner_id'])
        card.save_to_db()
        return card.json()

    def get(self):
        cards_arg = reqparse.RequestParser()
        cards_arg.add_argument('owner_id', type=int)
        cards_arg = cards_arg.parse_args()
        data = c.get_cards_by_userID(cards_arg['owner_id'])
        return data


class UserRegister(Resource):
    def post(self):
        data = _user_parser.parse_args()

        if U.find_by_username(data['username']):
            return {"message": "A user with that username already exists"}, 400

        user = U(data['username'], data['password'])
        user.save_to_db()

        user_json = user.json()

        return {"message": user_json}, 201


class UserLogin(Resource):
    def post(self):
        data = _user_parser.parse_args()
        user = U.find_by_username(data['username'])

        if user and safe_str_cmp(user.password, data['password']):
            access_token = create_access_token(identity=user.id, fresh=True)
            refresh_token = create_refresh_token(user.id)
            return {
                       'access_token': access_token,
                       'refresh_token': refresh_token,
                       'user': user.json()
                   }, 200

        return {"message": "Invalid Credentials!"}, 401


class UserLogout(Resource):
    @jwt_required
    def post(self):
        jti = get_raw_jwt()['jti']
        BLACKLIST.add(jti)
        return {"message": "Successfully logged out"}, 200


class User(Resource):
    """
    This resource can be useful when testing our Flask app. We may not want to expose it to public users, but for the
    sake of demonstration in this course, it can be useful when we are manipulating data regarding the users.
    """

    @classmethod
    def get(cls, user_id: int):
        user = U.find_by_id(user_id)
        if not user:
            return {'message': 'User Not Found'}, 404
        return user.json(), 200

    @classmethod
    def delete(cls, user_id: int):
        user = U.find_by_id(user_id)
        if not user:
            return {'message': 'User Not Found'}, 404
        user.delete_from_db()
        return {'message': 'User deleted.'}, 200


class TokenRefresh(Resource):
    @jwt_refresh_token_required
    def post(self):
        current_user = get_jwt_identity()
        new_token = create_access_token(identity=current_user, fresh=False)
        return {'access_token': new_token}, 200
