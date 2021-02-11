from django.contrib.auth.mixins import UserPassesTestMixin


class OwnerOnlyMixin(UserPassesTestMixin):
    def test_func(self):
        editor = self.get_object()
        if self.request.user == editor.owner:
            return True

        return False
