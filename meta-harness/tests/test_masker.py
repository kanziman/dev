import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / 'harvester'))

from masker import mask_text, mask_entry


def test_masks_anthropic_api_key():
    result = mask_text('key is sk-ant-api03-abcdefghijklmnopqrst')
    assert '[MASKED:API_KEY]' in result
    assert 'sk-ant' not in result


def test_masks_openai_style_api_key():
    result = mask_text('key sk-aBcDeFgHiJkLmNoPqRsT1234')
    assert '[MASKED:API_KEY]' in result
    assert 'sk-' not in result


def test_masks_windows_path():
    result = mask_text(r'file at C:\Users\acrof\DEV\secret.py')
    assert '[MASKED:PATH]' in result
    assert 'acrof' not in result


def test_masks_unix_path():
    result = mask_text('/Users/acrof/DEV/secret.py')
    assert '[MASKED:PATH]' in result
    assert 'acrof' not in result


def test_masks_email():
    result = mask_text('contact user@example.com for info')
    assert '[MASKED:EMAIL]' in result
    assert 'user@example.com' not in result


def test_masks_bearer_token():
    result = mask_text('Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')
    assert '[MASKED:BEARER_TOKEN]' in result
    assert 'eyJ' not in result


def test_masks_password_field():
    result = mask_text('password: mysecret123')
    assert '[MASKED:PASSWORD]' in result
    assert 'mysecret123' not in result


def test_safe_text_unchanged():
    text = 'hello world, this is a normal message about Python'
    assert mask_text(text) == text


def test_mask_entry_applies_to_string_content():
    entry = {
        'type': 'user',
        'message': {'role': 'user', 'content': 'my key is sk-ant-api03-abcdefghijklmnopqrst'},
    }
    result = mask_entry(entry)
    assert '[MASKED:API_KEY]' in result['message']['content']
    assert result['type'] == 'user'
    assert result['message']['role'] == 'user'


def test_mask_entry_applies_to_list_content_text_blocks():
    entry = {
        'type': 'assistant',
        'message': {
            'role': 'assistant',
            'content': [
                {'type': 'text', 'text': 'use key sk-ant-api03-abcdefghijklmnopqrst here'},
                {'type': 'tool_use', 'id': 'tool1', 'name': 'Bash', 'input': {'command': 'ls'}},
            ],
        },
    }
    result = mask_entry(entry)
    blocks = result['message']['content']
    assert '[MASKED:API_KEY]' in blocks[0]['text']
    assert blocks[1] == {'type': 'tool_use', 'id': 'tool1', 'name': 'Bash', 'input': {'command': 'ls'}}


def test_mask_entry_skips_entries_without_message():
    entry = {'type': 'file-history-snapshot', 'data': 'something'}
    result = mask_entry(entry)
    assert result == entry
