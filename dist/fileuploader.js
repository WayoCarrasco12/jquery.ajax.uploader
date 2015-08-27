/*global FileUploaderView: true*/
/*global LPImage: true*/
/*global Waterfall: true*/
'use strict';

/**
 * controller for a simple image uploader
 * @param {Object} obj     DOM input that will be replaced
 * @param {JSON} options   list of configurations and callbacks
 */
var FileUploader = function(obj, options)
{
    this.$obj = $(obj);
    this.options = options;
    this.waterfall = new Waterfall();

    this.model = [];

    this.view = new FileUploaderView(this);
    this.view.init();

    this.preloadImages(options.images);
};

/**
 * preload image
 *
 * instantiate an xhr in order to retrieve image data from remote server
 * this method is used to add previously added images.
 * @param {Int} index indicates position of selected images
 * @param {LPImage} image @see : LPImage
 */
FileUploader.prototype.addImagePreloading = function(index, image) 
{
    var self = this;
    var img = null;
    var blob_image = new Blob();
    blob_image.name = image.name;

    // xhr.open('GET', self.options.base_url + image.src); 
    // xhr.responseType = 'blob';//force the HTTP response, response-type header to be blob

    // xhr.onload = function(e) 
    // {
        // blob = xhr.response;//xhr.response is now a blob object
        // blob.name = image.name;

    img = self.addImage(blob_image, true);

    // img.data = e.target.result;
    img.value = image.value;
    img.url = image.src;
    img.percentComplete = 100;

    if (self.options.thumbnail_origin == 'local')
    {
        self.view.showThumb(index, img.value);
    }
    else
    {
        var image_src = img.value;
        if (self.options.thumbnail !== '')
        {
            if (typeof(img.value) !== 'object')
            {
                img.value = $.parseJSON(img.value);
            }

            image_src = img.value[self.options.thumbnail];
        }

        self.view.showThumb(index, image_src);
    }
    self.view.updateurl();
    // };

    // xhr.send();
};


/**
 * preload a list of images
 *
 * iterates over each image in order to preload a thumb in each one 
 * this method is used to add previously added images.
 * @see FileUploader.addImagePreloading 
 * 
 */
FileUploader.prototype.preloadImages = function(images) 
{
    for (var i = 0; i < images.length; i++) 
    {
        var image = images[i];
        this.addImagePreloading(i, image);
    }
};

/**
 * add new image to model
 *
 * adds an LPImage object to the list of images to upload
 * @param {File} file contains info of the image retrieved from input 
 *
 * @return {LPImage} image from model
 */
FileUploader.prototype.addImage = function(file, is_uploaded) 
{
    var self = this;

    if (this.isImage(file.name))
    {
        var img = new LPImage({
            uploaded : is_uploaded,
            file : file,
            uploadurl : this.options.uploadurl,
            response_type : this.options.response_type,
            thumbnail : this.options.thumbnail,
            onprogress : function(percent)
            {
                self.view.updateUploadProgress(self.model.indexOf(img), percent);
            },
            onthumbprogress : function(percent)
            {
                self.view.updateThumbProgress(self.model.indexOf(img), percent);
            },
            onthumbloaded : function()
            {
                self.view.imageDataLoaded(self.model.indexOf(img));
            },
            onupdateurl : function(url)
            {
                self.view.updateurl(self.model.indexOf(img), url);
                if (self.options.thumbnail_origin === 'local')
                {
                    self.view.showThumb(self.model.indexOf(img), img.data);
                }
                else
                {
                    self.view.showThumb(self.model.indexOf(img), url);
                }
            },
        });

        if (!this.options.multi)
        {
            this.model = [];
            this.waterfall.clearImages();
        }

        this.model.push(img);
        this.waterfall.appendImage(img);

        this.view.addImage(img);
        return img;
    }
};

/**
 * detect if a given text correspond to an image name
 * @param  {String}  name name of image
 * @return {Boolean}      true if the image extensions is jpg or png
 *                        false if any other
 */
FileUploader.prototype.isImage = function(name) 
{
    if (name.toLowerCase().indexOf('.jpg') != -1 ||
        name.toLowerCase().indexOf('.png') != -1)
    {
        return true;
    }

    return false;
};

/**
 * return list of LPImage 
 * @return {Array} list of added images
 */
FileUploader.prototype.getImageList = function() 
{
    return this.model;
};

/**
 * return the currently used <input type="file" /> from dom
 * @return {object} DOM object that is clicked when you want to add images
 */
FileUploader.prototype.getInput = function() 
{
    return this.$obj;
};

/**
 * detect if all images are already uploaded
 * @return {Boolean} true if all images were uploaded
 *                   false if some image is still waiting to be uploaded
 */
FileUploader.prototype.isready = function() 
{
    for (var i = 0; i < this.model.length; i++) 
    {
        var uploaded = (this.model[i].percentComplete == 100);
        if (!uploaded)
        {
            return false;
        }
    }

    return true;
};

/**
 * return base_url given in @see: options
 * @return {String} options.base_url
 */
FileUploader.prototype.getBaseURL = function() 
{
    return this.options.base_url;
};

/**
 * return a list of uploaded images URL.
 * @return {Array} images uploaded
 */
FileUploader.prototype.getImagesData = function() 
{
    var values = [];
    for (var i = 0; i < this.model.length; i++) 
    {
        var image = this.model[i];
        if (image.value !== '')
        {
            if (typeof(image.value) !== 'string')
            {
                image.value = JSON.stringify(image.value);
            }

            values.push(image.value);
        }
    }

    return values;
};

FileUploader.prototype.deleteImage = function(index) 
{
    this.model.splice(index, 1);
};
'use strict';

var FileUploaderTemplates =  // jshint ignore : line
{
    'imgup-template' : ' \
        <div class="imgup" name="THEY HATIIN" > \
            <ul class="img-ulist" name="THEY SEE ME ROOOLLIN"> \
            </ul> \
        </div>',

    'imgup-image-template' : ' \
        <li> \
            <div class="img-container" > \
                <img src="" class="imgup-image" /> \
                <div class="imgup-progress" > \
                    <div class="imgup-progress-bar" ></div> \
                </div> \
                <div>\
                    <a class="imgup-delete-button" href="#!" >x</a>\
                </div>\
            </div> \
        </li>',

    'imgup-image-add-template' : ' \
        <li class="imgup-add-input-container" > \
            <input type="file" class="imgup-add-input" multiple="multiple" /> \
        </li>',

    'imgup-highlight-template' : '\
        <div class="img-container" > \
            <img src="{{ src }}" class="imgup-image-biger"/> \
        </div>\
    '
};


/**
 * View of a simple file uploader.
 * contains all DOM calls.
 * @param {FileUploader} controller contains a reference to controller 
 *                                  @see: FileUploader
 */
var FileUploaderView = function(controller)
{
    this.controller = controller;
    this.main_template = '';
    this.img_template = '';
    this.add_img_template = '';
    this.highlight_template = '';
    this.$images = [];
    this.$main_template = undefined;

    this.loadTemplates();
    this.thumbs_loading = [];
    this.is_loading = false;

    this.$container = $('<div class="imageuploader-container" ></div>');
};

/**
 * initialize all necesary DOM for starting add images
 */
FileUploaderView.prototype.init = function() 
{
    // hide obj
    var $input = this.controller.getInput();

    $input.css('visibility', 'hidden');
    $input.attr('type', 'text');
    $input.after(this.$container);
    this.render();
};

/**
 * apply events callbacks over an <input type="file" />
 * @param {Object} $input jQuery of an input
 */
FileUploaderView.prototype.addInputEvent = function($input) 
{
    var self = this;
    $input.change(function(evt)
    {
        var i = 0;
        var files = evt.target.files;

        for (i = 0; i < files.length; i++)
        {
            self.controller.addImage(files[i]);
        }
    });
};

/**
 * add dom for a given image
 * @param {LPImage} img html is generated with img parameters
 */
FileUploaderView.prototype.addImage = function(img) 
{
    console.log('ADDING!...');
    this.clearImages();
    var self = this;
    var $image_temp = $(this.img_template);
    var $button = $('.imgup-delete-button', $image_temp);
    var $input = $('.imgup-add-input-container', this.$main_template);

    $.data($button, 'lpparent', $image_temp);
    $.data($image_temp, 'lpimage', img);

    this.applyPercent($image_temp, img.thumbPercent);

    $($image_temp)
        .insertBefore($input);

    if (!this.controller.options.multi)
    {
        $input.addClass(this.controller.options.hidden_class);
    }

    if (this.controller.options.highlight_spot)
    {
        //CAMBIO DE VIEW, desaparece lista imagenes y entra la imagen en greande
        $image_temp.on('click', function()
        {
            if (self.controller.isready())
            {
                var $div_mayor = $(this).closest('div.imgup');
                var $ul = $(this).closest('ul.img-ulist');
                var img_src = $(this).find('img.imgup-image').attr('src');

                $ul.fadeOut('slow', function()
                    {
                        var aux_tmp = '<div class="img-container" id="img-container-big"> <img id="big-img" src="'+ img_src +'" class="imgup-image-biger"/> </div> <button class="done">DONE</button>';
                        $div_mayor.append(aux_tmp);

                        var $button_done = $div_mayor.find('button.done');
                        $('#big-img').on('dragstart', function(event)
                            {
                                //para que no se arrastre la imagen al fijar el numero
                                event.preventDefault();
                            });

                        //Boton para volver al view original -lista de imagenes-
                        $button_done.on('click', function()
                        {
                            var this_button = this;

                            $('#img-container-big').fadeOut('fast');
                            $(this).fadeOut('fast', function()
                                {
                                    $('#img-container-big').remove();
                                    this_button.remove();
                                    $ul.fadeIn('fast');
                                });                        
                        });
                    });
            }
        });
    }

    this.initDeleteButton($button);
    this.$images.push($image_temp);
};

FileUploaderView.prototype.initDeleteButton = function($button) 
{
    var self = this;
    var index = 0;
    var $image = null;

    $button.click(function()
    {
        if (self.controller.isready())
        {
            $image = $.data($button, 'lpparent');
            index = self.$images.indexOf($image);

            self.deleteImage(index);
        }
    });
};

FileUploaderView.prototype.deleteImage = function(index) 
{
    console.log('DELETING!');
    var $image = this.$images[index];
    var $input = $('.imgup-add-input-container', this.$main_template);

    $image.remove();
    this.$images.splice(index, 1);
    this.controller.deleteImage(index);

    this.updateurl();

    if (this.$images.length === 0)
    {
        $input.removeClass(this.controller.options.hidden_class);
    }
};

/**
 * load all templates form @see: FileUploaderTemplates
 */
FileUploaderView.prototype.loadTemplates = function() 
{
    console.log('loading templates...');
    this.main_template = FileUploaderTemplates['imgup-template'];
    this.img_template = FileUploaderTemplates['imgup-image-template'];
    this.add_img_template = FileUploaderTemplates['imgup-image-add-template'];

    if (this.controller.options.templates.list_container_template !== '')
    {
        this.main_template = $(this.controller.options.templates.list_container_template)
                                .html();
    }

    if (this.controller.options.templates.item_template !== '')
    {
        this.img_template = $(this.controller.options.templates.item_template).html();
    }

    if (this.controller.options.templates.input_template !== '')
    {
        this.add_img_template = $(this.controller.options.templates.input_template)
                                    .html();
    }
};

/**
 * clear the list of jQuery images and remove from DOM
 */
FileUploaderView.prototype.clearImages = function() 
{
    if (!this.controller.options.multi)
    {
        $('li', this.$container).each(function()
        {
            if (!$(this).hasClass('imgup-add-input-container'))
                $(this).remove();
        });

        this.$images = [];
    }
};

/**
 * render all new generated dom for image list
 */
FileUploaderView.prototype.render = function() 
{
    var multi = this.controller.options.multi;
    var self = this;
    var $main_temp = $(self.main_template);
    var $input_el = null;

    $('ul', $main_temp).append($(self.add_img_template));

    // return $main_temp;
    self.$container.html($main_temp);

    $input_el = $('.imgup-add-input', $main_temp);
    $input_el.attr('multiple', multi);

    self.$main_template = $main_temp;
    self.addInputEvent( $input_el );
};

/**
 * draw the uploading progress bar.
 * @param  {Int} index      number of image to update
 * @param  {Int} percent    percentage of progress
 */
FileUploaderView.prototype.updateUploadProgress = function(index, percent) 
{
    this.applyPercent(this.$images[index], percent);
};

/**
 * draw the loading progress of thumbnails.
 * @param  {Int} index      number of image to update
 * @param  {Int} percent    percentage of progress
 */
FileUploaderView.prototype.updateThumbProgress = function(index, percent) 
{
    this.applyPercent(this.$images[index], percent);
};

/**
 * hide progress bar when thumbnail data was loaded
 * @param  {Int} index    number of image to update
 */
FileUploaderView.prototype.imageDataLoaded = function(index) 
{
    $('.imgup-progress-bar', this.$images[index]).css('opacity', 1);
    $('.imgup-progress-bar', this.$images[index]).css('width', 0);
};

/**
 * show a thumbnail in an image
 * @param  {Int} index      number of image to update
 * @param  {String} url     route of thumbnail
 */
FileUploaderView.prototype.showThumb = function(index, url) 
{
    var self = this;

    this.thumbs_loading.push({ 
        'img' : $('img', self.$images[index]), 
        'url' : url,
        'index' : index
    });
    this.loadingThumbgs();

    // this.thumbs_loading = [];
    // this.is_loading = false;
};

/**
 * Waterfall for thumbnails progress
 *
 * only load one at time, and once finished load next
 */
FileUploaderView.prototype.loadingThumbgs = function()
{
    if (this.is_loading)
        return;

    var self = this;

    if (this.thumbs_loading.length > 0)
    {
        var thumb = this.thumbs_loading.shift();

        setTimeout(function()
        {
            var img = thumb.img;
            img.loaded = false;

            img.load(function()
            {
                if (!img.loaded)
                {
                    img.load = $.noop();
                    img.loaded = true;
                    img.css('opacity', '1');

                    self.is_loading = false;
                    self.loadingThumbgs();
                }
            });
            img.css('opacity', '0');
            img.attr('src', self.controller.getBaseURL() + thumb.url);

        }, 100);

        self.is_loading = true;

        return;
    }

    this.is_loading = false;
};

/**
 * draw the progress bar.
 * @param  {Int} index      number of image to update
 * @param  {Int} percent    percentage of progress
 */
FileUploaderView.prototype.applyPercent = function($el, percent) 
{
    $('.imgup-progress-bar', $el).css('width', (percent) + '%');
};

/**
 * fill a list of urls in the input
 */
FileUploaderView.prototype.updateurl = function() 
{
    var urls = this.controller.getImagesData();
    var $input = this.controller.getInput();

    $input.val(urls);
};
'use strict';

var LPImage = function(data)
{
    this.name = '';
    this.size = '';
    this.file = '';

    this.data = '';
    this.value = '';
    this.url = '';

    // events

    this.onthumbprogress = $.noop;
    this.onprogress = $.noop;
    this.onupdateurl = $.noop;
    this.uploadurl = '/';
    this.onthumbloaded = $.noop;
    this.response_type = 'string';
    this.thumbnail = '';
    this.uploaded = false;

    if (data !== undefined)
    {
        this.file = data.file !== undefined ? data.file : '';
        if (typeof(this.file) === 'object')
        {
            this.name = this.file.name !== undefined ? this.file.name : '';
            this.size = this.file.size !== undefined ? this.file.size : '';
        }

        this.onthumbprogress = data.onthumbprogress === undefined ? $.noop : data.onthumbprogress;
        this.onprogress = data.onprogress === undefined ? $.noop : data.onprogress;
        this.onupdateurl = data.onupdateurl === undefined ? $.noop : data.onupdateurl;
        this.uploadurl = data.uploadurl === undefined ? '/' : data.uploadurl;
        this.onthumbloaded = data.onthumbloaded === undefined ? $.noop : data.onthumbloaded;
        this.response_type = data.response_type === undefined ? 'string' : data.response_type;
        this.thumbnail = data.thumbnail === undefined ? 'thumbnail' : data.thumbnail;
        this.uploaded = data.uploaded === undefined ? false : data.uploaded;
    }

    this.thumbPercent = 0;
    this.percentComplete = 0;


    if (this.thumbnail !== '')
    {
        this.response_type = 'json';
    }

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

LPImage.prototype.generateBlob = function(b64Data, contentType, sliceSize) 
{
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    var byteCharacters = b64Data; // atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, {type: contentType});
    return blob;
};

LPImage.prototype.upload = function(callback) 
{
    var self = this;
    var data = new FormData();
    data.append('name', this.name);
    data.append('size', this.size);
    data.append('data', this.generateBlob(this.data, 'text/plain', 512));

    $.ajax({
        contentType: false,
        processData: false,
        cache: false,
        url : self.uploadurl,
        type: 'POST',
        xhr : function()
        {
            var xhr = $.ajaxSettings.xhr();

            if (xhr.upload) 
            {
                xhr.upload.addEventListener('progress', function(event) 
                {
                    var position = event.loaded || event.position;
                    self.percentComplete = Math.ceil(position/event.total * 100);
                    self.onprogress(self.percentComplete);
                }, false);
            }
            return xhr;
        },
        beforeSend : function(xhr, o)
        {
            o.data = data;
        }
    })
    .done(function(resp)
    {
        self.value = resp;

        self.onupdateurl(self.getThumbnailURI(resp));

        callback();

    });

};


LPImage.prototype.getThumbnailURI = function(resp) 
{
    if (this.response_type === 'string')
    {
        this.url = resp;
        return resp;
    }
    else
    {
        if (typeof(resp) !== 'object')
        {
            resp = $.parseJSON(resp);
        }
        else
        {
            this.value = JSON.stringify(resp);
        }
        this.url = resp[this.thumbnail];
        return resp[this.thumbnail];
    }
};
/*global FileUploader */
/*global FileUploaderTemplates */

'use strict';

(function ( $, window, document, undefined ) {

    // Create the defaults once
    var pluginName = 'fileuploader';
    var methods = {
        isready : function()
        {
            var ready = true;
            this.each(function()
                {
                    var file_uploader = $.data(this, 'plugin_' + pluginName);

                    if (!file_uploader.isready())
                    {
                        ready = false;
                    }
                });

            return ready;
        },
        somefunction : function()
        {
            console.log('class: ' + this.attr('class'));
        },
        loadimages : function(images)
        {
            this.each(function()
            {
                try
                {
                    $.data(this, 'plugin_' + pluginName).preloadImages(images);
                }
                catch (ex)
                {
                    // nothing here
                }
            });
        }
    };

    $.fn[pluginName] = function ( method_or_settings, settings ) 
    {

        var set = {
            base_url : '',
            uploadurl : '/',
            response_type : 'string',
            thumbnail : '',
            thumbnail_origin : 'local', // remote
            hidden_class : 'imgup-hidden',
            multi : true,
            highlight_spot: false,
            templates : {
                list_container_template : '',
                item_template : '',
                input_template : ''
            },
            images : []
        };

        if (methods[method_or_settings])
        {
            return methods[method_or_settings].call(this, settings);
        }
        else
        {
            settings = method_or_settings;
        }
        var options = $.extend( {}, set, settings );

        return this.each(function () 
        {
            if (!$.data(this, 'plugin_' + pluginName)) 
            {
                $.data(this, 'plugin_' + pluginName, 
                new FileUploader( this, options ));
            }
        });
    };

})( jQuery, window, document ); // jshint ignore: line


/*global LPImage*/
'use strict';


var Waterfall = function()
{
    this.images = [];
    this.upload_images = [];
    this.is_loading = false;
    this.is_uploading = false;
    this.uploading_counter = 0;
};

Waterfall.prototype.clearImages = function() 
{
    this.images = [];
};

Waterfall.prototype.appendImage = function(image) 
{
    if (!(image instanceof LPImage)) return false;

    if (!image.uploaded)
    {
        this.images.push(image);
        this.loadThumbs();

        return true;
    }

    return false;
};

Waterfall.prototype.loadThumbs = function() 
{
    if (this.is_loading)
        return;

    var self = this;

    if (this.images.length > 0)
    {
        var image = this.images.shift();

        if (!image.uploaded)
        {
            this.is_loading = true;
            image.loadThumb(function()
            {
                self.is_loading = false;
                self.loadThumbs();
                self.upload_images.push(image);

                self.uploadImages();
            });
        }

        return;
    }

    this.is_loading = false;
};

Waterfall.prototype.uploadImages = function() 
{
    if (this.is_uploading && this.uploading_counter >= 3)
        return;

    var self = this;

    if (this.upload_images.length > 0)
    {
        var image = this.upload_images.shift();

        this.is_uploading = true;
        this.uploading_counter += 1;
        image.upload(function()
        {
            self.uploading_counter -= 1;
            self.is_uploading = false;
            self.uploadImages();
        });

        return;
    }

    this.uploading_counter -= 1;
    this.is_uploading = false;
};
