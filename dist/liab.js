/*!
 * Liab Cropper JavaScript Library v0.1
 * Date: 2018-01-20T17:24Z
 */

(function() {

    "use strict";

    var self = {};
    
    window.Liab = function(element, options) {
        self.element = element;
        
        self.config['area-width'] = options.crop && options.crop.width ? options.crop.width : self.config['area-width'];
        self.config['area-height'] = options.crop && options.crop.height ? options.crop.height : self.config['area-height'];
        self.config['area-border'] = options.crop && options.crop.border ? options.crop.border : self.config['area-border'];
        self.config['area-border-color'] = options.crop && options.crop.borderСolor ? options.crop.borderСolor : self.config['area-border-color'];
        self.config['zone-label'] = options.label ? options.label : self.config['zone-label'];
        self.config['preview-img'] = options.previewImg ? options.previewImg : self.config['preview-img'];
        self.config['service'] = options.service ? options.service : self.config['service'];
        self.config['upload'] = options.upload ? options.upload : self.config['upload'];

        if (self.element) {
            drawZone();
            uploadFile(function() {
                showModal();
                load();
            });
            return;
        }
        console.error('element not found!')
    }

    self.element = false;
    self.canvas = false;
    self.ctx = false;
    self.file = false;
    self.config = {
        "area-x" : 0,
        "area-y" : 0,
        "area-width" : 200,
        "area-height" : 200,
        "area-border" : 2,
        "area-border-color" : "white",
        "move-mode" : "ball",
        "zone-label" : "Enter your image here.",
        "btn-confirm-label" : "Confirm",
        "btn-cancel-label" : "Cancel",
        "preview-img" : false,
        "service" : false,
        "upload" : false
    };

    function showModal() {
        var context = "";
        context += "<section class='modal modalWindow'>";
        context += "<section class='modalWrapper'>";
        context += "<canvas id='canvas' width='500' height='400'></canvas>";
        context += "</section>";
        context += "<div class='groupBtn'>";
        context += "<button class='confirmBtn' id='confirmBtn'>" + self.config['btn-confirm-label'] + "</button>";
        context += "<button data-close='modal' class='closeBtn'>" + self.config['btn-cancel-label'] + "</button>";
        context += "</div>";
        context += "</section>";
        context += "<section data-close='modal' class='modal overlay'></div>";
        
        var modal = document.createElement('div');
        modal.classList.add('modal');
        modal.classList.add('modalWindow');
        modal.innerHTML = context;
        document.body.appendChild(modal);

        var elms = document.querySelectorAll('[data-close]');
        var i;
        for (i = 0; i < elms.length; i ++) {
            elms[i].addEventListener('click', function() {
                modal.remove();
            }, false);
        }

        document.getElementById('confirmBtn').addEventListener('click', function() {
            var tmpCanvas = document.createElement('canvas'),
                tmpCtx = tmpCanvas.getContext('2d');
            tmpCanvas.width = self.config['area-width'];
            tmpCanvas.height = self.config['area-height'];
            tmpCtx.drawImage(self.canvas, self.config['area-x'] + self.config['area-border'],
                                        self.config['area-y'] + self.config['area-border'],
                                        self.config['area-width'] - (self.config['area-border'] + 2),
                                        self.config['area-height'] - (self.config['area-border'] + 2),
                                        0,
                                        0,
                                        self.config['area-width'],
                                        self.config['area-height']);

            var img = tmpCanvas.toDataURL('image/png');
            if (self.config['preview-img']) {
                document.getElementById(self.config['preview-img']).src = img;
            } else {
                document.getElementById('preview').src = img;
            }
            modal.remove();
            
            if (self.config['upload']) {
                var http = new XMLHttpRequest();
                http.open("POST", self.config['service'], true);
                http.onreadystatechange = function() {
                    if(http.readyState == 4 && http.status == 200) {
                        self.config['success'](http.responseText)
                    }
                }

                var fd = new FormData();
                fd.append('file', img);
                http.send(fd);
            }

        }, false);
    }

    function uploadFile(callback) {
        var input = document.getElementById('liab-file');
        input.addEventListener('change', function(e) {
            self.file = new Image();
            self.file.onload = function() {
                callback();
            }

            var fr = new FileReader();
            fr.onloadend = function() {
                self.file.src = fr.result;
            }
            fr.readAsDataURL(e.target.files[0]);
        }, false);
    }

    function drawZone() {
        var zone = document.createElement('div');
        var input = document.createElement('input');
        
        zone.classList.add("liab");
        zone.classList.add("zone");
        zone.innerText = self.config['zone-label'];
        input.type = "file";
        input.id = "liab-file";
        input.classList.add("file");

        if ( ! self.config['preview-img']) {
            var preview = document.createElement('img');
            preview.id = 'preview';
            self.element.appendChild(preview);
        }

        zone.appendChild(input);
        self.element.appendChild(zone);
    }

    function load() {
        var { canvas, ctx } = bootstrap();
        
        self.canvas = canvas;
        
        var width = canvas.width,
            height = canvas.height;

        var balls = [];
        
        ctx.beginPath();
        ctx.drawImage(self.file, 0, 0, width, height);
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.lineWidth = self.config['area-border'];
        ctx.strokeStyle = self.config['area-border-color'];
        ctx.rect(self.config['move-mode'] != "ball" ? self.config['area-x'] : width / 2 - self.config['area-width'] / 2, self.config['move-mode'] != "ball" ? self.config['area-y'] : height / 2 - self.config['area-height'] / 2, self.config['area-width'], self.config['area-height']);
        ctx.stroke();
        ctx.closePath();

        balls.push({
            "x" : self.config['move-mode'] != 'ball' ? self.config['area-x'] + self.config['area-width']  : width / 2 + self.config['area-width'] / 2,
            "y" : self.config['move-mode'] != 'ball' ? self.config['area-y'] + self.config['area-height'] : height / 2 + self.config['area-height'] / 2,
            "width" : 10,
            "height" : 10,
            "border" : 1,
            "border-color" : 'red',
            "cursor" : "nwse-resize"
        });

        window.balls = balls;

        for(var b in balls) {
            var ball = balls[b];
            
            ctx.beginPath();
            ctx.lineWidth = self.config['border'];
            ctx.strokeStyle = self.config['border-color'];
            ctx.rect(ball.x, ball.y, ball.width, ball.height);
            ctx.stroke();
            ctx.closePath();
        }

        canvas.addEventListener('mousemove', function(e) {
            var rect = canvas.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            var ball = balls[balls.length - 1];

            if (x >= ball.x && x <= ball.x + ball.width &&
                y >= ball.y && y <= ball.y + ball.height) {
                document.body.style.cursor = ball.cursor;
                return ;
            }
            document.body.style.cursor = "default";
        }, false);

        canvas.addEventListener('mousemove', function(e) {
            var rect = canvas.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            
            var left = self.config['area-x'] ? self.config['area-x'] : (canvas.width / 2) - (self.config['area-width'] / 2);
            var top = self.config['area-y'] ? self.config['area-y'] : (canvas.height / 2) - (self.config['area-height'] / 2);

            if (x > left && x <= self.config['area-width'] + left && y > top && y <= self.config['area-height'] + top) {
                document.body.style.cursor = "all-scroll";
            }
        }, false);

        canvas.addEventListener('mousedown', downBall, false);
    }

    function downBall(e) {
        
        var rect = canvas.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;

        var ball;
        for(var i in balls) {
            ball = balls[i];
            if (x >= ball.x && x <= ball.x + ball.width && y >= ball.y && y <= ball.y + ball.height) {
                var f = moveBall.bind({ball : ball});
                canvas.addEventListener('mousemove', f, false);
                canvas.addEventListener('mouseup', function() {
                    canvas.removeEventListener('mousemove', f, false);
                }, false);
            }
        }

        var left = self.config['area-x'] ? self.config['area-x']  : (canvas.width / 2) - (self.config['area-width'] / 2);
        var top = self.config['area-y'] ? self.config['area-y'] : (canvas.height / 2) - (self.config['area-height'] / 2);

        if (x > left && x <= self.config['area-width'] + left && y > top && y <= self.config['area-height'] + top) {
                        
                canvas.addEventListener('mousemove', moveAll, false);
                canvas.addEventListener('mouseup', function() {
                    canvas.removeEventListener('mousemove', moveAll, false);
                }, false);

                function moveAll(e) {
                    var rect = canvas.getBoundingClientRect();
                    var x = e.clientX - rect.left;
                    var y = e.clientY - rect.top;

                    self.config['area-x'] = x - (self.config["area-width"] / 2);
                    self.config['area-y'] = y - (self.config["area-height"] / 2);
                    self.config['move-mode'] = "all";
                    load();
                }
        }
    }

    function moveBall(e) {
        var rect = canvas.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        
        self.config['area-width'] = x - ((canvas.width / 2) - (self.config['area-width'] / 2));
        self.config['area-height'] = y - ((canvas.height / 2) - (self.config['area-height'] / 2));
        self.config['move-mode'] = "ball";
        load();
    }

    function bootstrap() {
        var canvas = document.getElementById('canvas'),
            width = canvas.width,
            height = canvas.height,
            ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, width, height);
        ctx.fillRect(0, 0, width, height);
        
        return {
            canvas : canvas,
            ctx : ctx
        };
    }
})();


window.addEventListener('load', function() {
    var liab = new Liab(document.getElementById('upload'), {
        crop : {
            border : 3,
            width: 150,
            height: 100,
            borderСolor : 'blue'
        },
        service : '/test.php',
        upload : true,
        success : function(data, ready) {
            console.log('Upload file');
        },
        label : "Enter your image here.",
        meta : {}
    });
});