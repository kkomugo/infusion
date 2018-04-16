/*
Copyright 2013-2018 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_3_0_0 = fluid_3_0_0 || {};

(function ($, fluid) {
    "use strict";

    /*******************************************************************************
     * selfVoicing
     *
     * The enactor that enables self voicing of the DOM
     *******************************************************************************/

    fluid.defaults("fluid.prefs.enactor.selfVoicing", {
        gradeNames: ["fluid.prefs.enactor", "fluid.orator.domReader"],
        preferenceMap: {
            "fluid.prefs.speak": {
                "model.enabled": "default"
            }
        }
    });

})(jQuery, fluid_3_0_0);
