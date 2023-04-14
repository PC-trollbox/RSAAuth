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

## WARNING

If you try using LAN, well... you have to set up some kind of port thing or proxy, idk. Or get HTTPS. Because SubtleCrypto features are limited to secure contexts, you need to use HTTPS or localhost.