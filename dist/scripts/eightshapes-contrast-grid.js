/* EightShapes Contrast Grid v1.0.0 */
/* DO NOT EDIT: The contents of this file are dynamically generated and will be overwritten */
var EightShapes = EightShapes || {};

EightShapes.CodeSnippet = (function () {
  "use strict";
  var $codeSnippet,
    formattedCss = false,
    showInlineStylesAsHex = true;

  function removeInteractionHooksFromMarkup(html) {
    var $markup = $(html).clone();
    $markup = $markup
      .find(".es-contrast-grid__key-swatch-controls")
      .remove()
      .end();
    $markup = $markup
      .find(".es-contrast-grid__table--dragtable-initialized")
      .removeClass("es-contrast-grid__table--dragtable-initialized")
      .end();
    $markup = $markup
      .find(".es-contrast-grid__content--sortable-initialized.ui-sortable")
      .removeClass(
        "es-contrast-grid__content--sortable-initialized ui-sortable"
      )
      .end();
    return $markup.prop("outerHTML");
  }

  function updatePersistentUrl() {
    $(".es-code-snippet__persistent-url").val(
      `${location.origin + location.pathname}?${$(
        ".es-color-form"
      ).serialize()}`
    );
  }

  function convertRgbInlineStylesToHex(string) {
    const rgbRegex = /rgba?\((\d+),\s?(\d+),\s?(\d+)\)/gim;
    let m;

    function replaceWithHex(match, p1, p2, p3) {
      return (
        "#" +
        ("0" + parseInt(p1, 10).toString(16)).slice(-2) +
        ("0" + parseInt(p2, 10).toString(16)).slice(-2) +
        ("0" + parseInt(p3, 10).toString(16)).slice(-2)
      );
    }

    string = string.replace(rgbRegex, replaceWithHex);
    return string;
  }

  function getGridMarkup() {
    var markup = $(".es-contrast-grid").prop("outerHTML");
    if (showInlineStylesAsHex) {
      markup = convertRgbInlineStylesToHex(markup);
    }

    return markup;
  }

  function showCodeSnippetLoading() {
    $(".es-code-snippet").addClass("es-code-snippet--loading");
  }

  function hideCodeSnippetLoading() {
    $(".es-code-snippet").removeClass("es-code-snippet--loading");
  }

  function updateContent(e) {
    updatePersistentUrl();
    showCodeSnippetLoading();

    setTimeout(function () {
      var content = getGridMarkup();
      content = removeInteractionHooksFromMarkup(content);
      $codeSnippet = $(".es-code-snippet code");

      var html = html_beautify(content, { preserve_newlines: false });
      // var html = Prism.highlight(formattedHtml, Prism.languages.html);
      html = $("<div/>").text(html).html();
      html =
        "&lt;!-- Contrast Grid generated by contrast-grid.eightshapes.com --&gt;\n" +
        "&lt;!-- Editable link: " +
        window.location.href +
        " --&gt;\n" +
        html;
      $codeSnippet.html(html);
      hideCodeSnippetLoading();
    }, 50);
  }

  function setEventHandlers() {
    var clipboard = new Clipboard(".es-code-snippet__copy-button");
    clipboard.on("success", function (e) {
      $(e.trigger).removeClass("es-code-snippet__copy-button--clicked");
      $(e.trigger).prop("offsetHeight");
      $(e.trigger)
        .addClass("es-code-snippet__copy-button--clicked")
        .find(".es-code-snippet__copy-response")
        .text("Copied!");
      e.clearSelection();
    });

    clipboard.on("error", function (e) {
      $(e.trigger).removeClass("es-code-snippet__copy-button--clicked");
      $(e.trigger).prop("offsetHeight");
      $(e.trigger)
        .addClass("es-code-snippet__copy-button--clicked")
        .find(".es-code-snippet__copy-response")
        .text("Press Ctrl + C to copy");
    });

    $("body").on("click", ".es-code-snippet__copy-button", function (e) {
      e.preventDefault();
    });

    $(document).on(
      "escg.show-tab-es-tabs__global-panel--copy-code",
      updateContent
    );

    // $(document).on("escg.contrastGridUpdated", updateContent);
  }

  var initialize = function initialize() {
    $codeSnippet = $(".es-code-snippet");
    setEventHandlers();
  };

  var public_vars = {
    initialize: initialize,
  };

  return public_vars;
})();

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

      if (hexValues.indexOf(hex) === -1) {
        hexValues.push(hex);
        colors.push(colorData);
      }
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

var EightShapes = EightShapes || {};

EightShapes.ContrastGrid = (function () {
  "use strict";
  var $updateButton,
    $grid,
    $gridContent,
    $foregroundKey,
    $foregroundKeyCellTemplate,
    $contentRowTemplate,
    $contentCellTemplate,
    $backgroundKey,
    showLabelsOnColumnKeys = false,
    gridData = {
      foregroundColors: [
        {
          hex: "#000",
          label: "Black",
        },
        {
          hex: "#323232",
        },
        {
          hex: "#4D4D4D",
        },
        {
          hex: "#F3F1F1",
        },
        {
          hex: "#FFF",
          label: "White",
        },
        {
          hex: "#DC6729",
        },
        {
          hex: "#3995A9",
          label: "Link Color",
        },
      ],
    };

  function getForegroundColors() {
    return gridData.foregroundColors;
  }

  function getBackgroundColors() {
    if (
      typeof gridData.backgroundColors === "undefined" ||
      gridData.backgroundColors.length === 0
    ) {
      return gridData.foregroundColors.slice(0);
    } else {
      return gridData.backgroundColors;
    }
  }

  function generateForegroundKey() {
    var colors = getForegroundColors();
    for (var i = 0; i < colors.length; i++) {
      var hex = colors[i].hex,
        hexLabel =
          typeof colors[i].label === "undefined" ? hex : colors[i].label,
        $foregroundKeyCell = $foregroundKeyCellTemplate.clone(),
        $swatch = $foregroundKeyCell.find(".es-contrast-grid__key-swatch"),
        $label = $swatch.find(".es-contrast-grid__key-swatch-label-text"),
        $hexLabel = $swatch.find(".es-contrast-grid__key-swatch-label-hex"),
        $removeAction = $swatch.find(".es-contrast-grid__key-swatch-remove");

      $swatch.css("backgroundColor", hex).attr("data-hex", hex);
      $removeAction.attr("data-hex", hex).attr("data-colorset", "foreground");

      if (showLabelsOnColumnKeys) {
        $label.text(hexLabel);
        $label.prop("title", hexLabel);
        if (hex !== hexLabel) {
          $hexLabel.text(hex);
        }
      } else {
        $label.text(hex);
      }

      $foregroundKey.append($foregroundKeyCell);
    }
  }

  function generateContentRows() {
    var foregroundColors = getForegroundColors(),
      backgroundColors = getBackgroundColors();

    for (var i = 0; i < backgroundColors.length; i++) {
      var bg = backgroundColors[i].hex,
        bgLabel =
          typeof backgroundColors[i].label === "undefined"
            ? bg
            : backgroundColors[i].label,
        $contentRow = $contentRowTemplate.clone(),
        $backgroundKeyCell = $contentRow.find(
          ".es-contrast-grid__background-key-cell"
        ),
        $swatch = $backgroundKeyCell.find(".es-contrast-grid__key-swatch"),
        $label = $swatch.find(".es-contrast-grid__key-swatch-label-text"),
        $hexLabel = $swatch.find(".es-contrast-grid__key-swatch-label-hex"),
        $removeAction = $swatch.find(".es-contrast-grid__key-swatch-remove");

      $swatch.css("backgroundColor", bg).attr("data-hex", bg);
      $removeAction.attr("data-hex", bg).attr("data-colorset", "background");
      $label.text(bgLabel);
      $label.prop("title", bgLabel);
      if (bgLabel !== bg) {
        $hexLabel.text(bg);
      }

      for (var j = 0; j < foregroundColors.length; j++) {
        var fg = foregroundColors[j].hex,
          $contentCell = $contentCellTemplate.clone();

        $contentCell
          .find(".es-contrast-grid__swatch")
          .css({ backgroundColor: bg, color: fg });

        if (bg == fg) {
          $contentCell
            .html("")
            .append("<div class='es-contrast-grid__swatch-spacer'></div>");
        }
        $contentRow.append($contentCell);
      }

      $gridContent.append($contentRow);
    }
  }

  function disableDragUi() {
    $(
      ".es-contrast-grid__content.es-contrast-grid__content--sortable-initialized"
    ).sortable("destroy");
    $(
      ".es-contrast-grid__table.es-contrast-grid__table--dragtable-initialized"
    ).dragtable("destroy");
  }

  function enableDragUi() {
    // Draggable Rows
    $(".es-contrast-grid__content")
      .addClass("es-contrast-grid__content--sortable-initialized")
      .sortable({
        axis: "y",
        containment: ".es-contrast-grid",
        placeholder: "es-contrast-grid__row-placeholder",
        handle: ".es-contrast-grid__key-swatch-drag-handle--row",
        tolerance: "pointer",
        start: function (event, ui) {
          var columnCount = $(".es-contrast-grid__row-placeholder td").length;
          ui.placeholder
            .html("")
            .append("<td colspan='" + columnCount + "'></td>");
          $(".es-contrast-grid__foreground-key")
            .find("th")
            .each(function (index) {
              ui.helper
                .find("td:nth-child(" + (index + 1) + ")")
                .width($(this).outerWidth() + "px");
            });
        },
        update: function (table) {
          var sortedColors = extractBackgroundColorsFromGrid();
          broadcastRowSort(sortedColors);
        },
      });

    // Draggable Columns
    $(".es-contrast-grid__table")
      .addClass("es-contrast-grid__table--dragtable-initialized")
      .dragtable({
        containment: ".es-contrast-grid",
        dragHandle: ".es-contrast-grid__key-swatch-drag-handle--column",
        dragaccept: ".es-contrast-grid__foreground-key-cell",
        persistState: function (table) {
          var sortedColors = extractForegroundColorsFromGrid();
          broadcastColumnSort(sortedColors);
        },
      });
  }

  function extractForegroundColorsFromGrid() {
    var sortedForegroundColors = [];
    $(".es-contrast-grid__key-swatch--foreground").each(function () {
      sortedForegroundColors.push($(this).attr("data-hex"));
    });

    return sortedForegroundColors;
  }

  function extractBackgroundColorsFromGrid() {
    var sortedBackgroundColors = [];
    $(".es-contrast-grid__key-swatch--background").each(function () {
      sortedBackgroundColors.push($(this).attr("data-hex"));
    });

    return sortedBackgroundColors;
  }

  function broadcastRowSort(sortedColors) {
    $(document).trigger("escg.rowsSorted", [sortedColors]);
  }

  function broadcastColumnSort(sortedColors) {
    $(document).trigger("escg.columnsSorted", [sortedColors]);
  }

  function broadcastGridUpdate() {
    $(document).trigger("escg.contrastGridUpdated");
  }

  function setKeyCellWidth() {
    var columnCount = $(".es-contrast-grid__table tr:first-child td").length;
    $(".es-contrast-grid__key-cell").attr("colspan", columnCount);
  }

  function disableRowAndColumnRemoval() {
    $grid.addClass("es-contrast-grid--row-and-column-removal-disabled");
  }

  function enableRowAndColumnRemoval() {
    $grid.removeClass("es-contrast-grid--row-and-column-removal-disabled");
  }

  function setGridUiStatus() {
    if (
      gridData.foregroundColors.length <= 1 &&
      gridData.backgroundColors.length <= 1
    ) {
      disableRowAndColumnRemoval();
    } else {
      enableRowAndColumnRemoval();
    }
  }

  function generateGrid() {
    generateForegroundKey();
    generateContentRows();
    setKeyCellWidth();
    addContrastToSwatches();
    addAccessibilityToSwatches();
    setKeySwatchLabelColors();
    truncateContrastDisplayValues();
    disableDragUi();
    enableDragUi();
    svg4everybody(); // render icons on IE
    broadcastGridUpdate();
    setGridUiStatus();
  }

  function truncateContrastDisplayValues() {
    var regex = /[\d]*.[\d][\d]/,
      dotZeroRegex = /[\d]*.0/;

    $(".es-contrast-grid__lc-contrast-ratio .value").each(function () {
      var $ratio = $(this),
        value = $(this).text();

      if (regex.exec(value) !== null) {
        // this matches x.xx numbers, truncate one number
        value = value.slice(0, -1);

        if (dotZeroRegex.exec(value) !== null) {
          value = value.slice(0, -2);
        }

        $ratio.text(value);
      }
      // if ($(this).text().endsWith('.')) {
      //     $(this).text($(this).text().slice(0, -1));
      // }
    });
  }

  function addAccessibilityToSwatches(shown) {
    var $swatches = $(".es-contrast-grid__swatch");

    shown = $.find(".es-color-form__checkbox-group");
    if (shown) {
      shown = {
        AAA: $(shown).find("#es-color-form__show-contrast--aaa:checked").length,
        AA: $(shown).find("#es-color-form__show-contrast--aa:checked").length,
        AA18: $(shown).find("#es-color-form__show-contrast--aa18:checked")
          .length,
        DNP: $(shown).find("#es-color-form__show-contrast--dnp:checked").length,
      };
    }

    $swatches.each(function () {
      var contrast = Math.abs(
          parseFloat(
            $(this).find(".es-contrast-grid__lc-contrast-ratio .value").text()
          )
        ),
        $pill = $(this).find(".es-contrast-grid__accessibility-label"),
        pillText = "DNP";

      $(this).show();
      // if (contrast >= 7.0) {
      if (contrast >= 90) {
        pillText = "AAA";
        if (!shown.AAA) {
          $(this).hide();
        }
        // } else if (contrast >= 4.5) {
      } else if (contrast >= 75) {
        pillText = "AA";
        if (!shown.AA) {
          $(this).hide();
        }
        // } else if (contrast >= 3.0) {
      } else if (contrast >= 60) {
        pillText = "AA18";
        if (!shown.AA18) {
          $(this).hide();
        }
      } else {
        if (!shown.DNP) {
          $(this).hide();
        }
      }

      $pill
        .text(pillText)
        .addClass(
          "es-contrast-grid__accessibility-label--" + pillText.toLowerCase()
        );
    });
  }

  function setKeySwatchLabelColors() {
    var $keys = $(".es-contrast-grid__key-swatch");
    $keys.each(function () {
      var backgroundColor = rgb2hex($(this).css("backgroundColor")),
        contrastWithWhite = getContrastRatioForHex("#FFFFFF", backgroundColor);

      if (contrastWithWhite === 1) {
        $(this).addClass(
          "es-contrast-grid--bordered-swatch es-contrast-grid--dark-label"
        );
      } else if (contrastWithWhite < 4.0) {
        $(this).addClass("es-contrast-grid--dark-label");
      }
    });
  }

  function addContrastToSwatches() {
    var $swatches = $(".es-contrast-grid__swatch");
    $swatches.each(function () {
      if (
        typeof $(this).css("backgroundColor") !== "undefined" &&
        typeof $(this).css("color") !== "undefined"
      ) {
        var backgroundColor = rgb2hex($(this).css("backgroundColor")),
          foregroundColor = rgb2hex($(this).css("color")),
          apcaContrast = bridgeContrast(foregroundColor, backgroundColor),
          contrastRatio = getContrastRatioForHex(
            foregroundColor,
            backgroundColor
          ),
          contrastWithWhite = getContrastRatioForHex(
            "#FFFFFF",
            backgroundColor
          );

        $(this)
          .find(".es-contrast-grid__contrast-ratio .value")
          .text(apcaContrast.wcag);
        $(this)
          .find(".es-contrast-grid__lc-contrast-ratio .value")
          .text(apcaContrast.lc.toFixed(2));
        if (contrastWithWhite === 1) {
          $(this).addClass(
            "es-contrast-grid--bordered-swatch es-contrast-grid--dark-label"
          );
        } else if (contrastWithWhite < 4.0) {
          $(this).addClass("es-contrast-grid--dark-label");
        }
      }
    });
  }

  function triggerUpdate() {
    EightShapes.CodeSnippet.updateContent(getGridMarkup());
  }

  function setTemplateObjects() {
    // Remove templates from the DOM after cloning into JS
    $foregroundKeyCellTemplate = $(
      "#es-contrast-grid__foreground-key-cell-template"
    )
      .clone()
      .removeAttr("id");
    $("#es-contrast-grid__foreground-key-cell-template").remove();
    $contentCellTemplate = $("#es-contrast-grid__content-cell-template")
      .clone()
      .removeAttr("id");
    $("#es-contrast-grid__content-cell-template").remove();

    $contentRowTemplate = $("#es-contrast-grid__content-row-template")
      .clone()
      .removeAttr("id");

    $("#es-contrast-grid__content-row-template").remove();
  }

  function setGridData(data) {
    gridData = data;
  }

  function resetGrid() {
    $grid.find(".es-contrast-grid__content-row").remove();
    $grid.find(".es-contrast-grid__foreground-key-cell").remove();
  }

  function setColumnLabelStatus() {
    if (gridData.backgroundColors.length > 0) {
      showLabelsOnColumnKeys = true;
    } else {
      showLabelsOnColumnKeys = false;
    }
  }

  function updateGrid(event, data) {
    setGridData(data);
    resetGrid();
    setColumnLabelStatus();
    generateGrid();
  }

  function changeTileSize(e, tileSize) {
    $(".es-contrast-grid")
      .removeClass(
        "es-contrast-grid--regular es-contrast-grid--compact es-contrast-grid--large"
      )
      .addClass("es-contrast-grid--" + tileSize);
    resetGrid();
    generateGrid();
  }

  function initializeEventHandlers() {
    $(document).on("escg.colorFormValuesChanged", updateGrid);
    $(document).on("escg.tileSizeChanged", changeTileSize);
    $(document).on(
      "click",
      ".es-contrast-grid__key-swatch-remove",
      function (e) {
        e.preventDefault();
        $(document).trigger("escg.removeColor", [
          $(this).attr("data-hex"),
          $(this).attr("data-colorset"),
        ]);
      }
    );
  }

  var initialize = function initialize() {
    $grid = $(".es-contrast-grid");
    $gridContent = $grid.find(".es-contrast-grid__content");
    $foregroundKey = $(".es-contrast-grid__foreground-key");

    initializeEventHandlers();
    setTemplateObjects();
  };

  var public_vars = {
    initialize: initialize,
    addAccessibilityToSwatches: addAccessibilityToSwatches,
  };

  return public_vars;
})();

// MIT Licensed function courtesty of Lea Verou
// https://github.com/LeaVerou/contrast-ratio/blob/gh-pages/color.js
Math.round = (function () {
  var round = Math.round;

  return function (number, decimals) {
    decimals = +decimals || 0;

    var multiplier = Math.pow(100, decimals);

    return round(number * multiplier) / multiplier;
  };
})();

// MIT Licensed functions courtesty of Qambar Raza
// https://github.com/Qambar/color-contrast-checker/blob/master/src/colorContrastChecker.js
var rgbClass = {
  toString: function () {
    return "<r: " + this.r + " g: " + this.g + " b: " + this.b + " >";
  },
};

function getRGBFromHex(color) {
  var rgb = Object.create(rgbClass),
    rVal,
    gVal,
    bVal;

  if (typeof color !== "string") {
    throw new Error("must use string");
  }

  rVal = parseInt(color.slice(1, 3), 16);
  gVal = parseInt(color.slice(3, 5), 16);
  bVal = parseInt(color.slice(5, 7), 16);

  rgb.r = rVal;
  rgb.g = gVal;
  rgb.b = bVal;

  return rgb;
}

function calculateSRGB(rgb) {
  var sRGB = Object.create(rgbClass),
    key;

  for (key in rgb) {
    if (rgb.hasOwnProperty(key)) {
      sRGB[key] = parseFloat(rgb[key] / 255, 10);
    }
  }

  return sRGB;
}

function calculateLRGB(rgb) {
  var sRGB = calculateSRGB(rgb);
  var lRGB = Object.create(rgbClass),
    key,
    val = 0;

  for (key in sRGB) {
    if (sRGB.hasOwnProperty(key)) {
      val = parseFloat(sRGB[key], 10);
      if (val <= 0.03928) {
        lRGB[key] = val / 12.92;
      } else {
        lRGB[key] = Math.pow((val + 0.055) / 1.055, 2.4);
      }
    }
  }

  return lRGB;
}

function calculateLuminance(lRGB) {
  return 0.2126 * lRGB.r + 0.7152 * lRGB.g + 0.0722 * lRGB.b;
}

function getContrastRatio(lumA, lumB) {
  var ratio, lighter, darker;

  if (lumA >= lumB) {
    lighter = lumA;
    darker = lumB;
  } else {
    lighter = lumB;
    darker = lumA;
  }

  ratio = (lighter + 0.05) / (darker + 0.05);

  return Math.round(ratio, 1);
}

function getContrastRatioForHex(foregroundColor, backgroundColor) {
  var color1 = getRGBFromHex(foregroundColor),
    color2 = getRGBFromHex(backgroundColor),
    l1RGB = calculateLRGB(color1),
    l2RGB = calculateLRGB(color2),
    l1 = calculateLuminance(l1RGB),
    l2 = calculateLuminance(l2RGB);

  return getContrastRatio(l1, l2);
}

function rgb2hex(rgb) {
  if (/^#[0-9A-F]{6}$/i.test(rgb)) {
    return rgb;
  }

  rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  function hex(x) {
    return ("0" + parseInt(x, 10).toString(16)).slice(-2);
  }
  return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

$(document).ready(function(){
    // Initialize the various components in the correct order
    EightShapes.ContrastGrid.initialize();
    EightShapes.CodeSnippet.initialize();
    EightShapes.ColorForm.initialize();

    $(".es-code-toggle").on("click", function(){
        $("body").addClass("es-code-toggle--visible");
        $(document).trigger("escg.show-tab-es-tabs__global-panel--copy-code");
    });

    $(".es-code-snippet__hide-button").on("click", function(){
        $("body").removeClass("es-code-toggle--visible");
    });
});
