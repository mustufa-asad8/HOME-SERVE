import hmac
import os
from django.http import JsonResponse

class InternalKeyMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.expected = os.getenv('INTERNAL_SERVICE_KEY', 'development-internal-key-change-me')

    def __call__(self, request):
        if request.path.startswith('/internal/'):
            provided = request.headers.get('X-Internal-Key', '')
            if not hmac.compare_digest(provided, self.expected):
                return JsonResponse({'message': 'Invalid internal service key'}, status=401)
        return self.get_response(request)
