### Example queries
```shell script
 curl -H "Content-Type: application/octet-stream" -H "x-augustin6-resource-file-name: second.png" -X POST http://localhost:54002/image --data-binary "@/home/vojta/Pictures/test.png"

curl -H "Content-Type: application/octet-stream" -H "x-augustin6-resource-file-name: att3.pdf" -X POST http://localhost:54002/attachment --data-binary "@/home/vojta/Downloads/priloha_736010893_0_rozhlasProhlaseni.pdf"
```