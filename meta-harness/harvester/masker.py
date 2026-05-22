import re
from typing import Any

_PATTERNS = [
    (re.compile(r'sk-ant-[A-Za-z0-9\-_]{20,}'), '[MASKED:API_KEY]'),
    (re.compile(r'sk-[A-Za-z0-9]{20,}'), '[MASKED:API_KEY]'),
    (re.compile(r'Bearer [A-Za-z0-9\-._~+/]+=*'), '[MASKED:BEARER_TOKEN]'),
    (re.compile(r'[Cc]:\\[Uu]sers\\[^\s"\'<>|*?\r\n]+'), '[MASKED:PATH]'),
    (re.compile(r'/[Uu]sers/[^\s"\'<>|*?\r\n]+'), '[MASKED:PATH]'),
    (re.compile(r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}'), '[MASKED:EMAIL]'),
    (re.compile(r'(?i)password\s*[:=]\s*\S{1,500}'), '[MASKED:PASSWORD]'),
]


def mask_text(text: str) -> str:
    for pattern, replacement in _PATTERNS:
        text = pattern.sub(replacement, text)
    return text


def _mask_string_leaves(obj: Any) -> Any:
    """Recursively mask all string leaf values in a dict or list."""
    if isinstance(obj, str):
        return mask_text(obj)
    if isinstance(obj, list):
        return [_mask_string_leaves(item) for item in obj]
    if isinstance(obj, dict):
        return {k: _mask_string_leaves(v) for k, v in obj.items()}
    return obj


def _mask_content(content: Any) -> Any:
    if isinstance(content, str):
        return mask_text(content)
    if isinstance(content, list):
        result = []
        for block in content:
            if not isinstance(block, dict):
                result.append(block)
                continue
            block_type = block.get('type')
            if block_type == 'text' and 'text' in block:
                block = {**block, 'text': mask_text(block['text'])}
            elif block_type == 'tool_use' and 'input' in block:
                block = {**block, 'input': _mask_string_leaves(block['input'])}
            elif block_type == 'tool_result' and 'content' in block:
                block = {**block, 'content': _mask_content(block['content'])}
            result.append(block)
        return result
    return content


def mask_entry(entry: dict) -> dict:
    if 'message' not in entry:
        return entry
    msg = entry['message']
    if 'content' not in msg:
        return entry
    return {**entry, 'message': {**msg, 'content': _mask_content(msg['content'])}}
