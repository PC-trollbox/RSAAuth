# RSA auth proof-of-concept
This is only a proof of concept, not a full security solution.

## How to get it working

`npm install express`, then...

1. Launch `node http_server`
2. Go to "Restore a forgotten key for this POC"
3. Click "Use Imagination".
4. Save the files if you want to back them up.
5. Go back to logon
6. Test with using your "Previous key ID" or use your key files.
7. You passed the authentication. And without even a single password request.
8. Bonus: register another key with another username to reveal a multi-user system

## SSL certificates
Launch `create-crt` or `create-crt.bat` (openssl required). Please, please don't rely on the version in the `openssl-win` folder, unless you really don't care about security. You can download your own version into the `openssl-win` or just remove the `openssl-win` folder from the execution if you already have OpenSSL. Skip that step if you don't want creating doing HTTPS access.

Note: software in `openssl-win` was downloaded at https://sourceforge.net/projects/openssl-for-windows/ .