(function ( $, window, document, undefined ) {

    // Create the defaults once
    var pluginName = 'fileuploader';
    var methods = {
        isready : function(options)
        {
            console.log(this);
            return $.data(this, "plugin_" + pluginName);
        }
    };

    $.fn[pluginName] = function ( method_or_settings, settings ) 
    {

        var set = {
            uploadurl : "/"
        };

        if (methods[method_or_settings])
        {
            return methods[method_or_settings].call(this, settings);
        }
        else
        {
            var settings = method_or_settings;
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


var FileUploader = function(obj, options)
{
    this.$obj = $(obj);
    this.options = options;

    this.model = [];

    this.view = new FileUploaderView(this);
    this.view.init();
}

FileUploader.prototype.addImage = function(name, size, data) 
{
    var self = this;
    if (this.isImage(name))
    {
        var img = new LPImage({
            name : name,
            size : size,
            data : data,
            uploadurl : this.options.uploadurl,
            onprogress : function(percent)
            {
                self.view.updateView(self.model.indexOf(img), percent);
            },
            onupdateurl : function()
            {
                self.view.updateurl();
            }
        });

        img.upload();

        this.model.push(img);

        return img;
    }
};

FileUploader.prototype.isImage = function(name) 
{
    if (name.indexOf(".jpg") != -1 ||
        name.indexOf(".png") != -1)
    {
        return true;
    }

    return false;
};

FileUploader.prototype.getImageList = function() 
{
    return this.model;
};


FileUploader.prototype.getInput = function() 
{
    return this.$obj;
};

FileUploader.prototype.isready = function() 
{
    for (var i = 0; i < this.model.length; i++) 
    {
        var uploaded = this.model[i].percentComplete == 100;
        if (!uploaded)
        {
            return false;
        }
    };

    return true;
};

FileUploader.prototype.getImagesURL = function() 
{
    var urls = [];
    for (var i = 0; i < this.model.length; i++) 
    {
        var image = this.model[i];
        urls.push(image.url);
    };

    return urls;
};