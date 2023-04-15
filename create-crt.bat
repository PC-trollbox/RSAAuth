@echo off
openssl-win/openssl req -x509 -out localhost.crt -keyout localhost.key -newkey rsa:2048 -nodes -sha256 -subj "/CN=localhost/"
mkdir key-crt
move localhost.crt key-crt/
move localhost.key key-crt/
pause