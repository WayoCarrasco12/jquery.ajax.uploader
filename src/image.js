'use strict';


// var LPImageUploadPool = function()
// {
//     this.images = [];
//     this.uploaded_images = [];
//     this.uploading = false;
// };


// LPImageUploadPool.prototype.addImage = function(image) 
// {
//     if (this.uploaded_images.indexOf(image) !== -1)
//     {
//         this.images.append(image);
//     }

//     if (!this.uploading)
//     {
//         this.processUpload();
//     }
// };


// LPImageUploadPool.prototype.processUpload = function() 
// {
//     if (this.images.length > 0)
//     {
//         var img = 
//     }
// };



var Waterfall = function()
{
    this.images = [];
    this.upload_images = [];
    this.is_loading = false;
    this.is_uploading = false;
};

Waterfall.prototype.appendImage = function(image) 
{
    this.images.push(image);
    this.loadThumbs();
};

Waterfall.prototype.loadThumbs = function() 
{
    if (this.is_loading)
        return;

    var self = this;

    if (this.images.length > 0)
    {
        var image = this.images.shift();

        this.is_loading = true;
        image.loadThumb(function()
        {
            self.is_loading = false;
            self.loadThumbs();
            self.upload_images.push(image);

            self.uploadImages();
        });

        return;
    }

    this.is_loading = false;
};

Waterfall.prototype.uploadImages = function() 
{
    if (this.is_uploading)
        return;

    var self = this;

    if (this.upload_images.length > 0)
    {
        var image = this.upload_images.shift();

        this.is_uploading = true;
        image.upload(function()
        {
            self.is_uploading = false;
            self.uploadImages();
        });

        return;
    }

    this.is_uploading = false;
};


var LPImage = function(data)
{
    this.name = data.file.name === undefined ? '' : data.file.name;
    this.size = data.file.size === undefined ? '' : data.file.size;
    this.file = data.file;
    this.data = '';
    this.url = '';

    // events
    this.onthumbprogress = data.onthumbprogress === undefined ? $.noop() : data.onthumbprogress;
    this.onprogress = data.onprogress === undefined ? $.noop() : data.onprogress;
    this.onupdateurl = data.onupdateurl === undefined ? $.noop() : data.onupdateurl;
    this.uploadurl = data.uploadurl === undefined ? '/' : data.uploadurl;
    this.onthumbloaded = data.onthumbloaded === undefined ? $.noop() : data.onthumbloaded;

    this.thumbPercent = 0;
    this.percentComplete = 0;
};

LPImage.prototype.loadThumb = function(callback) 
{
    var self = this;
    var reader = new FileReader();

    reader.onload = function(e) 
    {
        self.data = e.target.result;
        self.onthumbloaded(self.data);
        setTimeout(function()
        {
            callback();
        }, 100);
    };

    reader.onprogress = function(data)
    {
        if (data.lengthComputable)
        {
            self.thumbPercent = parseInt((data.loaded / data.total) * 100);
            self.onthumbprogress(self.thumbPercent);
            return;
        }

        self.thumbPercent = 100;
    };

    reader.readAsDataURL(this.file);
};

LPImage.prototype.upload = function(callback) 
{
    var data = new FormData();
    data.append('name', this.name);
    data.append('size', this.size);
    data.append('data', this.data);

    var self = this;

    var request = new XMLHttpRequest();
    request.onreadystatechange = function(){
        if(request.readyState == 4){
            try {
                var resp = request.response;

                self.url = resp;
                self.onupdateurl(resp);

                callback();
            } catch (e){
                var resp = {
                    status: 'error',
                    data: 'Unknown error occurred: [' + request.responseText + ']'
                };
            }
        }
    };

    request.upload.addEventListener('progress', function(e)
    {
        self.percentComplete = Math.ceil(e.loaded/e.total) * 100;
        self.onprogress(self.percentComplete);
    }, false);


    request.open('POST', self.uploadurl);
    request.send(data);

    // var data = {
    //     'name' : this.name,
    //     'size' : this.size,
    //     'data' : this.data
    // };

    // $.ajax({
    //     url : this.uploadurl,
    //     method : 'POST',
    //     cache : false,
    //     data : data,
    //     xhr : function()
    //     {
    //         var xhr = new window.XMLHttpRequest();
    //         //Download progress
    //         xhr.upload.addEventListener(
    //             'progress', 
    //             function (evt) 
    //             {
    //                 if (evt.lengthComputable) 
    //                 {
    //                     self.percentComplete = Math.round((evt.loaded / evt.total) * 100);
    //                     self.onprogress(self.percentComplete);
    //                 }
    //                 else
    //                 {
    //                     self.percentComplete = 100;
    //                     self.onprogress(self.percentComplete);
    //                 }
    //             }, false);
    //         return xhr;
    //     },

    // }).done(function(data)
    // {
    //     callback();
    //     self.url = data;
    //     self.onupdateurl();
    // });
        // var self = this;
        // var data = {
        //         'name' : this.name,
        //         'size' : this.size
        //     };

        // $.ajax({
        //     url : this.uploadurl, 
        //     method : 'POST',
        //     cache : false,
        //     data : data,
        //     xhr : function()
        //     {
        //         var xhr = new window.XMLHttpRequest();
        //         //Download progress
        //         xhr.addEventListener(
        //             'progress', 
        //             function (evt) 
        //             {
        //                 if (evt.lengthComputable) 
        //                 {
        //                     self.percentComplete = Math.round((evt.loaded / evt.total) * 100);
        //                     self.onprogress(self.percentComplete);
        //                 }
        //                 else
        //                 {
        //                     self.percentComplete = 100;
        //                     self.onprogress(self.percentComplete);
        //                 }
        //             }, false);
        //         return xhr;
        //     }
        // })
        // .done(function(data)
        //     {
        //         self.url = data;
        //         self.onupdateurl();
        //     });
};