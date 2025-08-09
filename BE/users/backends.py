# users/backends.py
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

UserModel = get_user_model()

class EmailBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        # simple-jwt sẽ truyền email vào tham số 'username'
        # vì chúng ta đã đặt USERNAME_FIELD = 'email'
        try:
            # Tìm user bằng email, không phân biệt hoa thường
            user = UserModel.objects.get(email__iexact=username)
        except UserModel.DoesNotExist:
            return None
        else:
            # Kiểm tra mật khẩu và đảm bảo user có thể đăng nhập
            if user.check_password(password) and self.user_can_authenticate(user):
                return user
        return None