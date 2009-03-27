/*
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid_1_0*/

fluid_1_0 = fluid_1_0 || {};


/******************
 * Textfield Slider *
 ******************/

(function ($, fluid) {

    var initTextfieldSlider = function (that) {
        var textfield = that.locate("textfield");
        textfield.val(that.model);

        var sliderOptions = that.options.sliderOptions;
        sliderOptions.value = that.model;
        sliderOptions.min = that.options.min;
        sliderOptions.max = that.options.max;
        var slider = that.locate("slider").slider(sliderOptions);

        textfield.change(function () {
            if (this.value < that.min) {
                this.value = that.min;
            } else if (this.value > that.max) {
                this.value = that.max;
            }
            
            if (that.isInRange(this.value)) {
                slider.slider("value", this.value);
                that.updateModel(this.value, this);
            } else { 
                // handle invalid entry
                this.value = that.model;
            }
        });
        
        textfield.keypress(function (evt) {
            if (evt.keyCode !== $.ui.keyCode.ENTER) {
                return true;
            }
            return false;
        });

        slider.bind("slide", function (e, ui) {
            textfield.val(ui.value);
            that.updateModel(ui.value, slider);
        });
    };
    
    /**
     * A component that relates a textfield and a jQuery UI slider
     * @param {Object} container
     * @param {Object} options
     */
    fluid.textfieldSlider = function (container, options) {
        var that = fluid.initView("fluid.textfieldSlider", container, options);
        that.model = that.options.value || that.locate("textfield").val();
        that.min = that.options.min;
        that.max = that.options.max;
        
        initTextfieldSlider(that);
        
        /**
         * Tests if a value is within the min and max of the textfield slider
         * @param {Object} value
         */
        that.isInRange = function (value) {
            return (value >= that.min && value <= that.max);
        };
        
        /**
         * Updates the model if it is in range. Fires model changed
         * @param {Object} model
         * @param {Object} source
         */
        that.updateModel = function (model, source) {
            if (that.isInRange(model)) {
                that.events.modelChanged.fire(model, that.model, source);
                that.model = model;
            } else {
                // TODO: should do something here
                // Throw an error
            }
        };
        
        return that;
    };

    fluid.defaults("fluid.textfieldSlider", {
        selectors: {
            textfield: ".flc-textfield-slider-field",
            slider: ".flc-textfield-slider-slider"
        },
        events: {
            modelChanged: null
        },
        sliderOptions: {
            orientation: "horizontal"
        }, 
        min: 0,
        max: 100,
        value: null       
    });
    
})(jQuery, fluid_1_0);


/**************
 * UI Options *
 **************/

(function ($, fluid) {

//    TODO
//    - fix the test that is throwing an error (the issue is the preview not loading because the path is hardcoded in the template)
//    - make the preview a subcomponent
//    - move the general renderer tree generation functions to the renderer
//    - document the API
//    - add the min font size textfieldSlider to the renderer tree
//    - pull the strings out of the template and put them into the component?
//    - should the accordian be part of the component by default?

    var createSelectNode = function (id, selection, list, names) {
        return {
            ID: id,
            selection: {
                valuebinding: selection
            },
            optionlist: {
                valuebinding: list
            },
            optionnames: {
                valuebinding: names
            }
        };
    };
        
    var createSimpleBindingNode = function (id, binding) {
        return {
            ID: id,
            valuebinding: binding
        };
    };
    
    var generateTree = function (that, rendererModel) {
        var children = [];
        children.push(createSelectNode("text-font", "selections.textFont", "labelMap.textFont.values", "labelMap.textFont.names"));
        children.push(createSelectNode("text-spacing", "selections.textSpacing", "labelMap.textSpacing.values", "labelMap.textSpacing.names"));
        children.push(createSelectNode("theme", "selections.theme", "labelMap.theme.values", "labelMap.theme.names"));

        var bgiExplodeOpts = {
            selectID: "background-images",
            rowID: "background-images-row:",
            inputID: "background-images-choice",
            labelID: "background-images-label"
        };        
        children.push(createSelectNode("background-images", "selections.backgroundImages", "labelMap.backgroundImages.values", "labelMap.backgroundImages.names"));
        children = children.concat(fluid.explodeSelectionToInputs(that.options.controlValues.backgroundImages, bgiExplodeOpts));
        
        var layoutExplodeOpts = {
            selectID: "layout",
            rowID: "layout-row:",
            inputID: "layout-choice",
            labelID: "layout-label"
        };        
        children.push(createSelectNode("layout", "selections.layout", "labelMap.layout.values", "labelMap.layout.names"));
        children = children.concat(fluid.explodeSelectionToInputs(that.options.controlValues.layout, layoutExplodeOpts));

        var tocExplodeOpts = {
            selectID: "toc",
            rowID: "toc-row:",
            inputID: "toc-choice",
            labelID: "toc-label"
        };        
        children.push(createSelectNode("toc", "selections.toc", "labelMap.toc.values", "labelMap.toc.names"));
        children = children.concat(fluid.explodeSelectionToInputs(that.options.controlValues.layout, tocExplodeOpts));

        children.push(createSimpleBindingNode("links-underline", "selections.linksUnderline"));
        children.push(createSimpleBindingNode("links-bold", "selections.linksBold"));
        children.push(createSimpleBindingNode("links-larger", "selections.linksLarger"));
        children.push(createSimpleBindingNode("inputs-larger", "selections.inputsLarger"));
        
        return {
            children: children
        };
    };
    
    var bindHandlers = function (that) {
        that.locate("save").click(that.save);
        that.locate("reset").click(that.reset);
        that.locate("cancel").click(that.cancel);
    };
    
    var initPreview = function (that) {
        var previewFrame = that.locate("previewFrame");
        var previewEnhancer;
        
        that.events.modelChanged.addListener(function (model) {
            /**
             * Setimeout is temp fix for http://issues.fluidproject.org/browse/FLUID-2248
             */
            setTimeout(function () {
                if (previewEnhancer) {
                    previewEnhancer.updateModel(model);
                }
            }, 0);
        });

        previewFrame.load(function () {
            var previewFrameContents = previewFrame.contents();
            var options = {
                savedSettings: that.model,
                tableOfContents: that.uiEnhancer.options.tableOfContents,
                settingsStore: {
                    type: "fluid.uiEnhancer.tempStore"
                }
            };
            previewEnhancer = fluid.uiEnhancer(previewFrameContents, options);
        });        
        
    };
        
    var createLabelMap = function (options) {
        var labelMap = {};
        
        for (var item in options.controlValues) {
            labelMap[item] = {
                names: options.strings[item],
                values: options.controlValues[item]
            };
        }
        
        return labelMap;
    };

    var createRenderOptions = function (that) {
        // Turn the boolean select values into strings so they can be properly bound and rendered
        that.model.toc = String(that.model.toc);
        that.model.backgroundImages = String(that.model.backgroundImages);
        
        var superModel = fluid.assembleSuperModel({
            selections: {
	            model: that.model,
                applier: that.applier
            },
            labelMap: {model: createLabelMap(that.options)}
        });
        
        return {
            model: superModel.model,
            applier: superModel.applier,
            autoBind: true, 
            debugMode: true
       //     renderRaw: true
        };
    };
    
    var initSliders = function (that) {
        var createOptions = function (settingName) {
            return {
                listeners: {
                    modelChanged: function (value) {
                    	that.applier.requestAlteration(settingName, value);
                    }
                },
                value: that.model[settingName]
            };    
        };
        
        var options = createOptions("textSize");
        fluid.merge(null, options, that.options.textMinSize.options);
        fluid.initSubcomponents(that, "textMinSize", [that.options.selectors.textMinSizeCtrl, options]);

        options = createOptions("lineSpacing");
        fluid.merge(null, options, that.options.lineSpacing.options);
        fluid.initSubcomponents(that, "lineSpacing", [that.options.selectors.lineSpacingCtrl, options]);
        
    };
        
    var mergeSiteDefaults = function (options, siteDefaults) {
        for (var settingName in options.controlValues) {
            var setting = String(siteDefaults[settingName]);
            var settingValues = options.controlValues[settingName];
            
            if (setting) {
                var index = $.inArray(setting, settingValues);
                if (index === -1) {
                    var defaultIndex = $.inArray("default", settingValues);
                    if (defaultIndex === -1) {
                        settingValues.push(setting);
                    } else {
                        settingValues[defaultIndex] = setting;
                    }
                }
            }
        }
    };
    
    var setupUIOptions = function (that) {
        that.applier.modelChanged.addListener("*",
            function (newModel, oldModel, dar) {
                that.events.modelChanged.fire(newModel, oldModel, dar.source);
            }
        );
            
        mergeSiteDefaults(that.options, that.uiEnhancer.defaultSiteSettings);
        
        // TODO: This stuff should already be in the renderer tree
        that.events.afterRender.addListener(function () {
            initSliders(that);
            bindHandlers(that);
            initPreview(that);        
        });
        
        var rendererOptions = createRenderOptions(that);
        var template = fluid.selfRender(that.container, generateTree(that, rendererOptions.model), rendererOptions);
     
        that.events.afterRender.fire();
            
        return template;
    };
    
    fluid.uiOptions = function (container, options) {
        var that = fluid.initView("fluid.uiOptions", container, options);
        that.uiEnhancer = $(document).data("uiEnhancer");
        that.model = fluid.copy(that.uiEnhancer.model);
        that.applier = fluid.makeDARApplier(that.model);

        // TODO: we shouldn't need the savedModel and should use the uiEnhancer.model instead
        var savedModel = that.uiEnhancer.model;
        var template;
 
        that.save = function () {
            that.events.onSave.fire(that.model);
            savedModel = fluid.copy(that.model); 
            that.uiEnhancer.updateModel(savedModel);
        };

        that.reset = function () {
            that.events.onReset.fire();
            that.updateModel(fluid.copy(that.uiEnhancer.defaultSiteSettings), that);
            that.refreshView();
        };
        
        that.cancel = function () {
            that.events.onCancel.fire();
            that.updateModel(fluid.copy(savedModel), that);
            that.refreshView();            
        };
        
        that.refreshView = function () {
            var rendererOptions = createRenderOptions(that);
            fluid.reRender(template, that.container, generateTree(that, rendererOptions.model), rendererOptions);
            that.events.afterRender.fire();
        };
        
        that.updateModel = function (newModel, source) {
            that.events.modelChanged.fire(newModel, that.model, source);
            fluid.clear(that.model);
            fluid.model.copyModel(that.model, newModel);
        };
        
        template = setupUIOptions(that);

        return that;   
    };

    fluid.defaults("fluid.uiOptions", {
        textMinSize: {
            type: "fluid.textfieldSlider",
            options: {
                min: 6,
                max: 30
            }
        },
        lineSpacing: {
            type: "fluid.textfieldSlider",
            options: {
                min: 1,
                max: 10
            }
        },
        selectors: {
            controls: ".flc-uioptions-control",
            textMinSizeCtrl: ".flc-uioptions-min-text-size",
            lineSpacingCtrl: ".flc-uioptions-line-spacing",
            cancel: ".flc-uioptions-cancel",
            reset: ".flc-uioptions-reset",
            save: ".flc-uioptions-save",
            previewFrame : ".flc-uioptions-preview-frame"
        },
        events: {
            modelChanged: null,
            onSave: null,
            onCancel: null,
            onReset: null,
            afterRender: null
        },
        strings: {
            textFont: ["Serif", "Sans-Serif", "Arial", "Verdana", "Courier", "Times"],
            textSpacing: ["Regular", "Wide", "Wider", "Widest"],
            theme: ["Low Contrast", "Medium Contrast", "Medium Contrast Grey Scale", "High Contrast", "High Contrast Inverted"],
            backgroundImages: ["Yes", "No"],
            layout: ["Yes", "No"],
            toc: ["Yes", "No"]
        },
        controlValues: { 
            textFont: ["serif", "sansSerif", "arial", "verdana", "courier", "times"],
            textSpacing: ["default", "wide1", "wide2", "wide3"],
            theme: ["lowContrast", "default", "mediumContrast", "highContrast", "highContrastInverted"],
            backgroundImages: ["true", "false"],
            layout: ["simple", "default"],
            toc: ["true", "false"]
        }
    });

})(jQuery, fluid_1_0);