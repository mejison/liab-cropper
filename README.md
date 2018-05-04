# Liab-cropper
Simple image cropper into javascript

# Introduction
This is the main repository to maintain the libraries' assets on CDNJS. For our website and API, please refer to the new-website repository. You can find all repositories at CDNJS on GitHub!

# Usage
Include cdn required
```sh
<link rel="stylesheet" src="http://cdnjs.com/liab/0.1/liab.css" />
<script src="http://cdnjs.com/liab/0.1/liab.js"></script>
```
And enjoy
```sh
new Liab(document.getElementById('avatar'))
```

### Options
This options insert two artugments into constructor Liab like this
```sh
new Liab(document.getElementById('avatar'), {
     crop : {
            border : 3,
            width: 150,
            height: 100,
            borderСolor : 'blue'
        },
        service : '/server.php',
        upload : true,
        success : function(data) {
            console.log('Upload file');
        },
        label : "Enter your image here."
})
```
| Option | Description |
| ------ | ------ |
| crop.border | Thickness border crop |
| crop.width | Width area crop |
| crop.height | Height area crop |
| crop.borderСolor | Fill color area crop |
| service | Url address where send file |
| upload | If ture Liab send file to service (true/false) |
| label | Text upload zone |

License
----
MIT
**Free Software, Hell Yeah!**