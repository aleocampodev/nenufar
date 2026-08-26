import litellm
from litellm.integrations.custom_logger import CustomLogger

# 1. Disable prompt_cache_key injection for Groq
try:
    from litellm.llms.anthropic.experimental_pass_through.adapters.transformation import LiteLLMAnthropicMessagesAdapter
    LiteLLMAnthropicMessagesAdapter._supports_prompt_cache_key = staticmethod(lambda model, provider: False)
except Exception as e:
    pass

# 2. Cap max_tokens to 1024
try:
    from litellm.llms.anthropic.experimental_pass_through.adapters.handler import LiteLLMMessagesToCompletionTransformationHandler
    _orig_prepare = LiteLLMMessagesToCompletionTransformationHandler._prepare_completion_kwargs

    def _patched_prepare_completion_kwargs(*args, **kwargs):
        if "max_tokens" in kwargs and isinstance(kwargs["max_tokens"], int) and kwargs["max_tokens"] > 1024:
            kwargs["max_tokens"] = 1024
        return _orig_prepare(*args, **kwargs)

    LiteLLMMessagesToCompletionTransformationHandler._prepare_completion_kwargs = staticmethod(_patched_prepare_completion_kwargs)
except Exception as e:
    pass

class StripUnsupportedParams(CustomLogger):
    async def async_pre_call_hook(self, user_api_key_dict, cache, data, call_type):
        if isinstance(data, dict):
            data.pop("prompt_cache_key", None)
            data.pop("prompt_cache_retention", None)
            if "max_tokens" in data and isinstance(data["max_tokens"], int) and data["max_tokens"] > 1024:
                data["max_tokens"] = 1024
            if "max_completion_tokens" in data and isinstance(data["max_completion_tokens"], int) and data["max_completion_tokens"] > 1024:
                data["max_completion_tokens"] = 1024
        return data

custom_handler = StripUnsupportedParams()
