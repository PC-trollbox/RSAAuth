# RSA auth proof-of-concept
This is only a proof of concept, not a full security solution.

## How to get it working

`npm install express`, then...

1. Generate a new secrettoken if you feel that's necessary
2. Launch `node http_server`
3. Go to "Restore a forgotten key for this POC"
4. Click "Use Imagination" or input your own public key (needs to be working with SubtleCrypto!)
5. Save the files if you used the "Use Imagination" button (this is NOT necessary but useful for backup reasons)
6. Go back to logon
7. Test with using your "Previous key ID" or use your key files.
8. You passed the authentication. And without even a single password request.

## WARNING

If you try using LAN, well... you have to set up some kind of port thing or proxy, idk. Or get HTTPS. Because SubtleCrypto features are limited to secure contexts, you need to use HTTPS or localhost.