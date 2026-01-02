class Config():
    DEBUG=False
    SQLALCHEMY_TRACK_MODIFICATIONS=True

class LocalDevelopmentConfig(Config):
    SQLALCHEMY_DATABASE_URI="sqlite:///lmsv2.sqlite3"
    DEBUG=True


    SECRET_KEY="this-is-a-secretkey"#session encryption
    SECURITY_PASSWORD_HASH="bcrypt" #HASHING
    SECURITY_PASSWORD_SALT="this-is-a-password-salt" 
    WTF_CSRF_ENABLED=False
    SECURITY_TOKEN_AUTHENTICATION_HEADER="Authentication-Token"

    