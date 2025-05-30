var EightShapes = EightShapes || {};

EightShapes.ColorForm = (function () {
  "use strict";

  var $colorForm,
    $foregroundColorsInput,
    $backgroundColorsInput,
    foregroundColors,
    backgroundColors,
    hexRegex = /^(#?[A-Fa-f0-9]{6}|#?[A-Fa-f0-9]{3})(,.*)?/gim;

  function $_GET(name) {
    var queryString = window.location.search;
    var urlParams = new URLSearchParams(queryString);

    return urlParams.get(name);
  }

  function loadInFigmaTokens() {
    return getVariablesByFile("0d4N1vP8N9g6ixDI6mnMG3").then(function (
      variableStore
    ) {
      if (!variableStore) return;

      var foregroundValue = "";
      var backgroundValue = "";
      var semanticVariables = [];
      var surfaceVariables = [];
      var variableKeys = Object.keys(variableStore.variables);

      var variables = variableKeys.map(function (key) {
        var variable = variableStore.variables[key];
        var variableName = variable.name.toLowerCase();
        var semanticDefs = [
          "negative",
          "info",
          "positive",
          "caution",
          "attention",
          "intelligence",
        ];

        if (variableName.indexOf("surface") > -1) {
          surfaceVariables.push(variable);
          backgroundValue += `${variable.value}, ${variable.name}
`;
        }

        for (var i = 0, l = semanticDefs.length; i < l; i++) {
          if (variableName.indexOf(semanticDefs[i]) > -1) {
            semanticVariables.push(variable);
            foregroundValue += `${variable.value}, ${variable.name}
`;
            break;
          }
        }

        return variable;
      });

      $backgroundColorsInput.val(backgroundValue);
      $foregroundColorsInput.val(foregroundValue);
    });

    // return getVariablesByFile("0d4N1vP8N9g6ixDI6mnMG3");
  }

  function resolveVariableValues() {
    return EightShapes.FigmaVariableStore.then(function (variableStore) {
      if (!variableStore) return;

      return Promise.all(
        Object.keys(variableStore.variables).map(function (variableID) {
          return resolveVariableValue(variableID);
        })
      ).then(() => EightShapes.FigmaVariableStore);
    });
  }

  function rgbValue(num) {
    return Math.round(num * 255);
  }

  function figmaRGBtoHex(rgbObject) {
    if (typeof rgbObject === "object") {
      return rgb2hex(
        `rgb(${rgbValue(rgbObject.r)}, ${rgbValue(rgbObject.g)}, ${rgbValue(
          rgbObject.b
        )})`
      );
    } else {
      return rgbObject;
    }
  }

  function resolveVariableValue(id) {
    return getVariableById(id).then(function (variable) {
      if (!variable) return;

      return getVariableModes(variable.variableCollectionId).then(function (
        modes
      ) {
        var modeId = modes[0].modeId;
        var variableMode = variable.valuesByMode[modeId];

        if (variableMode.type === "VARIABLE_ALIAS") {
          resolveVariableValue(variableMode.id).then(function (value) {
            variable.value = figmaRGBtoHex(value);
          });
        } else {
          variable.value = figmaRGBtoHex(variableMode);
          return variableMode;
        }
      });
    });
  }

  function getVariableModes(collectionId) {
    return getCollectionById(collectionId).then(function (collection) {
      return collection.modes;
    });
  }

  function getVariableById(variableId) {
    return EightShapes.FigmaVariableStore.then((variableStore) => {
      return variableStore.variables[variableId];
    });
  }

  function getCollectionById(collectionId) {
    return EightShapes.FigmaVariableStore.then((variableStore) => {
      return variableStore.variableCollections[collectionId];
    });
  }

  function getVariablesByFile(FILE_KEY) {
    // TODO: set data to localstorage?
    var localVariableStore;
    EightShapes.FigmaVariableStore = figmaFetch(
      `/v1/files/${FILE_KEY}/variables/local`
    ).then((data) => data?.meta);

    return resolveVariableValues();
  }

  function figmaFetch(ENDPOINT) {
    var figmaToken = $_GET("figmatoken");

    if (!figmaToken) {
      return Promise.resolve(false);
    }

    console.log(figmaToken);

    return fetch(`https://api.figma.com${ENDPOINT}`, {
      method: "GET",
      headers: {
        "X-FIGMA-TOKEN": figmaToken,
      },
    }).then((resp) => resp.json());
  }

  function processColorInput($input) {
    var value = $input.val(),
      m,
      hexValues = [],
      colors = [];

    while ((m = hexRegex.exec(value)) !== null) {
      if (m.index === hexRegex.lastIndex) {
        hexRegex.lastIndex++;
      }

      var hex = m[1],
        label = m[2],
        colorData = { hex: false };

      if (hex.indexOf("#") !== 0) {
        hex = "#" + hex;
      }

      colorData.hex = hex.toUpperCase();

      if (typeof label !== "undefined") {
        label = label.slice(1).trim(); //Remove the leading comma matched in the regex and any leading or trailing whitespace
        if (label.length > 0) {
          colorData.label = label;
        }
      }

      // if (hexValues.indexOf(label) === -1) {
      hexValues.push(label);
      colors.push(colorData);
      // }
    }

    if ($input.attr("id") == "es-color-form__foreground-colors") {
      foregroundColors = colors;
    } else if ($input.attr("id") == "es-color-form__background-colors") {
      backgroundColors = colors;
    }
  }

  function updateInputText(inputName, text) {
    $("#es-color-form__" + inputName + "-colors").val(text);
  }

  function convertGridDataToText(colors) {
    var text = "";

    colors.forEach(function (colorData) {
      text += colorData.hex;
      if (typeof colorData.label !== "undefined") {
        text += ", " + colorData.label;
      }
      text += "\n";
    });
    return text;
  }

  function removeColorFromData(hex, colors) {
    colors = colors.filter(function (color) {
      return color.hex !== hex ? true : false;
    });
    return colors;
  }

  var removeColor = function removeColor(e, hex, colorset) {
    colorset =
      colorset === "background" && backgroundColors.length === 0
        ? "foreground"
        : colorset;
    var colors =
        colorset === "background" ? backgroundColors : foregroundColors,
      gridDataText = "";
    colors = removeColorFromData(hex, colors);
    gridDataText = convertGridDataToText(colors);
    updateInputText(colorset, gridDataText);
    broadcastFormValueChange();
  };

  function getCurrentGridData() {
    $colorForm.find(".es-color-form__textarea").each(function () {
      processColorInput($(this));
    });

    var gridData = {
      foregroundColors: foregroundColors,
      backgroundColors: backgroundColors,
    };

    return gridData;
  }

  function broadcastFormValueChange() {
    var gridData = getCurrentGridData();
    $(document).trigger("escg.colorFormValuesChanged", [gridData]);
    updateUrl();
  }

  function sortForegroundColors(e, sortedColorsKey) {
    var sortedForegroundColors = [],
      gridDataText = "";
    sortedColorsKey.forEach(function (hexKey) {
      foregroundColors.forEach(function (colorData) {
        if (colorData.hex === hexKey) {
          sortedForegroundColors.push(colorData);
        }
      });
    });
    gridDataText = convertGridDataToText(sortedForegroundColors);
    updateInputText("foreground", gridDataText);
    broadcastFormValueChange();
  }

  function sortBackgroundColors(e, sortedColorsKey) {
    var sortedBackgroundColors = [],
      gridDataText = "",
      inputField = "",
      startingColorData;

    if (backgroundColors.length > 0) {
      inputField = "background";
      startingColorData = backgroundColors;
    } else {
      inputField = "foreground";
      startingColorData = foregroundColors;
    }

    sortedColorsKey.forEach(function (hexKey) {
      startingColorData.forEach(function (colorData) {
        if (colorData.hex === hexKey) {
          sortedBackgroundColors.push(colorData);
        }
      });
    });
    gridDataText = convertGridDataToText(sortedBackgroundColors);
    updateInputText(inputField, gridDataText);
    broadcastFormValueChange();
  }

  function toggleBackgroundColorsInput(e) {
    if (typeof e !== "undefined") {
      e.preventDefault();
    }
    var $backgroundColors = $("#es-color-form__background-colors"),
      $foregroundColors = $("#es-color-form__foreground-colors");
    if (
      $(".es-color-form").hasClass(
        "es-color-form--show-background-colors-input"
      )
    ) {
      // hide the background Colors Input
      $(".es-color-form").removeClass(
        "es-color-form--show-background-colors-input"
      );
      $("label[for='es-color-form__foreground-colors']").text("Rows & Columns");
      $foregroundColors.attr("data-persisted-text", $foregroundColors.val());
      $foregroundColors.val($backgroundColors.val());
      $backgroundColors.val("");
      broadcastFormValueChange();
    } else {
      // show the background Colors Input
      $(".es-color-form").addClass(
        "es-color-form--show-background-colors-input"
      );
      $("label[for='es-color-form__foreground-colors']").text("Columns");

      if ($backgroundColors.val().length == 0) {
        // $backgroundColors will already have a value when loading from the url
        $backgroundColors.val($foregroundColors.val());
      }

      if (
        typeof $foregroundColors.attr("data-persisted-text") !== "undefined"
      ) {
        $foregroundColors.val($foregroundColors.attr("data-persisted-text"));
      }
      broadcastFormValueChange();
    }
  }

  function broadcastTileSizeChange(e) {
    var tileSize = $colorForm
      .find("input[name='es-color-form__tile-size']:checked")
      .val();
    $(document).trigger("escg.tileSizeChanged", [tileSize]);
    updateUrl();
  }

  function broadcastCodeSnippetViewToggle(e) {
    e.preventDefault();
    $(document).trigger("escg.showCodeSnippet");
  }

  function updateUrl(forceURL) {
    const figmaToken = $_GET("figmatoken");
    const searchParams =
      figmaToken && !forceURL
        ? `figmatoken=${figmaToken}`
        : $colorForm.serialize();

    window.history.pushState(
      false,
      false,
      `${location.pathname}?${searchParams}`
    );
  }

  // function disableFormFields() {
  //     $colorForm.find("textarea, input").prop("disabled", true);
  // }

  // function enableFormFields() {
  //     $colorForm.find("textarea, input").prop("disabled", false);
  // }

  function initializeEventHandlers() {
    $foregroundColorsInput.typeWatch({
      wait: 500,
      callback: broadcastFormValueChange,
    });
    $backgroundColorsInput.typeWatch({
      wait: 500,
      callback: broadcastFormValueChange,
    });
    $(document).on("escg.removeColor", removeColor);
    $(document).on("escg.columnsSorted", sortForegroundColors);
    $(document).on("escg.rowsSorted", sortBackgroundColors);
    // $(document).on('escg.show-tab-es-tabs__global-panel--copy-code', disableFormFields);
    // $(document).on('escg.show-tab-es-tabs__global-panel--analyze', enableFormFields);
    $(
      ".es-color-form__show-background-colors, .es-color-form__hide-background-colors"
    ).on("click", toggleBackgroundColorsInput);
    $("input[name='es-color-form__tile-size']").on(
      "change",
      broadcastTileSizeChange
    );
    $("input[name='es-color-form__show-contrast']").on("change", function () {
      EightShapes.ContrastGrid.addAccessibilityToSwatches();
      updateUrl();
    });
    $(".es-color-form__view-code-toggle").on(
      "click",
      broadcastCodeSnippetViewToggle
    );
  }

  function loadFormDataFromUrl() {
    if (location.search.substr(1).length > 0) {
      $colorForm.deserialize(location.search.substr(1));
    } else {
      // loading for the first time, no query string
      enableAllContrastSwatches();
    }

    // Toggling contrast swatches was added in version 1.1.0, if the URL was saved prior to that version, enable all contrast swatch tiles by default
    if (!location.search.substr(1).includes("version=1.1.0")) {
      enableAllContrastSwatches();
    }

    if ($backgroundColorsInput.val().length > 0) {
      toggleBackgroundColorsInput();
    }
  }

  function enableAllContrastSwatches() {
    // toggle all accessibility swatches on
    $("input[name='es-color-form__show-contrast']").attr("checked", true);
  }

  var initialize = function initialize() {
    $colorForm = $(".es-color-form");
    $foregroundColorsInput = $("#es-color-form__foreground-colors");
    $backgroundColorsInput = $("#es-color-form__background-colors");
    loadInFigmaTokens().then(function () {
      loadFormDataFromUrl();
      initializeEventHandlers();
      broadcastFormValueChange();
      broadcastTileSizeChange();
    });
  };

  var public_vars = {
    initialize: initialize,
    removeColor: removeColor,
    updateUrl: updateUrl,
  };

  return public_vars;
})();
