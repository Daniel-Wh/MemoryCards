from db import db


class Cards(db.Model):
    # create table
    __tablename__ = 'Cards'

    id = db.Column(db.Integer, primary_key=True)

    question = db.Column(db.String(256))
    answer = db.Column(db.String(256))
    course = db.Column(db.String(64))
    owner_id = db.Column(db.Integer, db.ForeignKey('User.id'), nullable=False)

    def __init__(self, question, answer, course, owner_id):
        self.question = question
        self.answer = answer
        self.course = course
        self.owner_id = owner_id

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def json(self):
        return {
            'question': self.question,
            'answer': self.answer,
            'course': self.course
        }

    @classmethod
    def get_cards_by_userID(cls, owner_id):
        cards = []
        row = db.session.query(cls).filter(cls.owner_id == owner_id)
        if row is None:
            return []

        for card in row:
            objects = {
                'question': card.question,
                'answer': card.answer,
                'course': card.course
            }
            cards.append(objects)

        return cards


class User(db.Model):

    __tablename__ = 'User'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    cards = db.relationship('Cards', backref='user', lazy=True)

    def __init__(self, email, password):
        self.email = email
        self.password = password

    def json(self):
        return {
            'id': self.id,
            'email': self.email
        }

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    @classmethod
    def find_by_username(cls, email):
        return cls.query.filter_by(email=email).first()

    @classmethod
    def find_by_id(cls, _id):
        return cls.query.filter_by(id=_id).first()
