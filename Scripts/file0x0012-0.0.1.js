"use strict";
$(function () {
    "use strict";
    console.log("file0x0012-0.0.1");
    var stdout = null;
    var canvas = null;
    var context = null;
    var println = function (str) {
        $("<div>").text(str).appendTo(stdout);
    };
    var stageState = null;
    // graphics parameters
    var defaultGridSizeParameter = 21.0;
    var defaultGridStrokeLineWidth = 13.0;
    var defaultCursorFillStyle = "#FF00FF";
    var defaultCursorInvertedFillStyle = "#40C040";
    var defaultCursorStrokeWidth = defaultGridStrokeLineWidth;
    var gridSizeParameter;
    var gridSize_width, gridSize_height;
    var getGridSizeParameter = function () {
        return gridSizeParameter;
    };
    var setGridSizeParameter = function (value) {
        if (value < 1) {
            value = 1;
        }
        _a = [value, 3.0 * value, 3.0 * value], gridSizeParameter = _a[0], gridSize_width = _a[1], gridSize_height = _a[2];
        var _a;
    };
    setGridSizeParameter(defaultGridSizeParameter);
    var gridStrokeLineWidth = defaultGridStrokeLineWidth;
    var cursorFillStyle = defaultCursorFillStyle;
    var cursorInvertedFillStyle = defaultCursorInvertedFillStyle;
    var cursorStrokeWidth = defaultCursorStrokeWidth;
    var stageSize_width, stageSize_height;
    // game parameters
    stageSize_width = 6;
    stageSize_height = 6;
    // TODO: review
    var defaultDifficulty = 4.0;
    var difficulty = defaultDifficulty;
    var defaultConnectionRate = 1.0 / 4.0;
    var connectionRate = defaultConnectionRate;
    var graphicsBuffered = false;
    var gridsContextOffset_x, gridsContextOffset_y;
    gridsContextOffset_x = 0.5 + 12.0;
    gridsContextOffset_y = 0.5 + 12.0 + 10.0 + 3.0;
    var drawGridsLines = function (context) {
        var x, y;
        var s = gridStrokeLineWidth;
        var _a = [stageSize_width, stageSize_height], w = _a[0], h = _a[1];
        var _b = [gridSize_width, gridSize_height], dx = _b[0], dy = _b[1];
        context.strokeStyle = '#FFFFFF';
        context.fillStyle = '#FFFFFF';
        context.lineWidth = s;
        y = dy + s / 2.0 + gridsContextOffset_y;
        for (var m = 1; m <= h; ++m) {
            x = dx + s / 2.0 + gridsContextOffset_x;
            for (var n = 1; n <= w; ++n) {
                context.strokeRect(x - s / 2.0, y - s / 2.0, dx + s, dy + s);
                x += dx + s;
            }
            y += dy + s;
        }
    };
    var toContextLocation = function (m, n) {
        return [(m + 1) * gridSize_width + gridStrokeLineWidth * m, (n + 1) * gridSize_height + gridStrokeLineWidth * n];
    };
    var drawGridsConnection = function (context, m, n, c) {
        var _a = toContextLocation(m, n), x = _a[0], y = _a[1];
        var _b = [(gridSize_width + gridStrokeLineWidth * 2.0) / 3.0, (gridSize_height + gridStrokeLineWidth * 2.0) / 3.0], w = _b[0], h = _b[1];
        x += gridsContextOffset_x;
        y += gridsContextOffset_y;
        switch (c) {
            case ThisGame.Connection.Up_Left:
                context.beginPath();
                context.moveTo(x, y);
                context.ellipse(x - w, y - h, w, h, 0.0, 0.0, 0.0 + Math.PI / 2.0);
                context.lineTo(x, y);
                context.fill();
                context.stroke();
                break;
            case ThisGame.Connection.Down_Right:
                context.beginPath();
                context.moveTo(x, y);
                context.ellipse(x + w, y + h, w, h, 0.0, Math.PI, Math.PI + Math.PI / 2.0);
                context.lineTo(x, y);
                context.fill();
                context.stroke();
                break;
            case ThisGame.Connection.Down_Left:
                context.beginPath();
                context.moveTo(x, y);
                context.ellipse(x - w, y + h, w, h, 0.0, Math.PI * 1.5, Math.PI * 1.5 + Math.PI / 2.0);
                context.lineTo(x, y);
                context.fill();
                context.stroke();
                break;
            case ThisGame.Connection.Up_Right:
                context.beginPath();
                context.moveTo(x, y);
                context.ellipse(x + w, y - h, w, h, 0.0, Math.PI * 0.5, Math.PI * 0.5 + Math.PI / 2.0);
                context.lineTo(x, y);
                context.fill();
                context.stroke();
                break;
            default:
        }
    };
    var drawGridsConnections = function (context, grids, w, h) {
        context.lineWidth = gridStrokeLineWidth;
        for (var n = 0; h > n; ++n) {
            for (var m = 0; w > m; ++m) {
                var c = grids[m + w * n];
                if (ThisGame.Connection.Down_Left === (ThisGame.Connection.Down_Left & c)) {
                    drawGridsConnection(context, m, n, ThisGame.Connection.Down_Left);
                }
                if (ThisGame.Connection.Down_Right === (ThisGame.Connection.Down_Right & c)) {
                    drawGridsConnection(context, m, n, ThisGame.Connection.Down_Right);
                }
                if (ThisGame.Connection.Up_Left === (ThisGame.Connection.Up_Left & c)) {
                    drawGridsConnection(context, m, n, ThisGame.Connection.Up_Left);
                }
                if (ThisGame.Connection.Up_Right === (ThisGame.Connection.Up_Right & c)) {
                    drawGridsConnection(context, m, n, ThisGame.Connection.Up_Right);
                }
            }
        }
    };
    var toCursorPolygonPoints = function (position) {
        var a = new Array(12);
        var s = (gridStrokeLineWidth + 1.0) / 2.0;
        var sh = cursorStrokeWidth + (s + 1.0) / 2.0;
        var st = sh * 3.0 / 2.0;
        var _a = toContextLocation(position.x, position.y), x = _a[0], y = _a[1];
        x += gridsContextOffset_x;
        y += gridsContextOffset_y;
        switch (position.direction) {
            case ThisGame.Direction.Up:
                y += gridSize_height / 2.0;
                break;
            case ThisGame.Direction.Right:
                x -= gridSize_width / 2.0;
                break;
            case ThisGame.Direction.Left:
                x += gridSize_width / 2.0;
                break;
            case ThisGame.Direction.Down:
                y -= gridSize_height / 2.0;
                break;
            default:
        }
        switch (position.direction) {
            case ThisGame.Direction.Down:
                a.push(x - s), a.push(y - st);
                a.push(x - s), a.push(y);
                a.push(x - sh), a.push(y);
                a.push(x), a.push(y + sh);
                a.push(x + sh), a.push(y);
                a.push(x + s), a.push(y);
                a.push(x + s), a.push(y - st);
                break;
            case ThisGame.Direction.Left:
                a.push(x + st), a.push(y - s);
                a.push(x), a.push(y - s);
                a.push(x), a.push(y - sh);
                a.push(x - sh), a.push(y);
                a.push(x), a.push(y + sh);
                a.push(x), a.push(y + s);
                a.push(x + st), a.push(y + s);
                break;
            case ThisGame.Direction.Right:
                a.push(x - st), a.push(y - s);
                a.push(x), a.push(y - s);
                a.push(x), a.push(y - sh);
                a.push(x + sh), a.push(y);
                a.push(x), a.push(y + sh);
                a.push(x), a.push(y + s);
                a.push(x - st), a.push(y + s);
                break;
            case ThisGame.Direction.Up:
                a.push(x - s), a.push(y + st);
                a.push(x - s), a.push(y);
                a.push(x - sh), a.push(y);
                a.push(x), a.push(y - sh);
                a.push(x + sh), a.push(y);
                a.push(x + s), a.push(y);
                a.push(x + s), a.push(y + st);
                break;
            default:
        }
        return a;
    };
    var drawCursor = function (context, position, fillStyle) {
        var p = toCursorPolygonPoints(position);
        context.fillStyle = fillStyle;
        context.beginPath();
        context.moveTo(p[0], p[1]);
        for (var i = 3; p.length > i; i += 2) {
            context.lineTo(p[i - 1], p[i]);
        }
        context.fill();
    };
    var hints = null;
    var cursorVisible = false;
    var cursorInverted = false;
    var drawCursors = function (context) {
        if (null !== hints) {
            for (var _i = 0, hints_1 = hints; _i < hints_1.length; _i++) {
                var i = hints_1[_i];
                drawCursor(context, i, '#FFD700');
            }
        }
        if (cursorVisible) {
            drawCursor(context, stageState.currentPosition, cursorInverted ? cursorInvertedFillStyle : cursorFillStyle);
        }
    };
    var draw0 = function (context) {
        drawGridsLines(context);
        if (null === stageState) {
            var s = new ThisGame.StageState(stageSize_width, stageSize_height);
            s.randomize(connectionRate);
            drawGridsConnections(context, s.grids, 1 + stageSize_width, 1 + stageSize_height);
        }
        else {
            drawGridsConnections(context, stageState.grids, stageState.width, stageState.height);
            drawCursor(context, stageState.departurePosition, '#800080');
            {
                var dst = stageState.destinationPosition;
                var _a = [dst.direction, dst.x, dst.y], d = _a[0], x = _a[1], y = _a[2];
                switch (dst.direction) {
                    case ThisGame.Direction.Up:
                        --y;
                        break;
                    case ThisGame.Direction.Right:
                        ++x;
                        break;
                    case ThisGame.Direction.Left:
                        --x;
                        break;
                    case ThisGame.Direction.Down:
                        ++y;
                        break;
                    default:
                }
                drawCursor(context, new ThisGame.Position(d, x, y), '#90EE90');
            }
        }
        graphicsBuffered = true;
    };
    var gameDataEnabled = false;
    var worker = null;
    var handleGameStarting = function (ev, data) {
        $("#MenuItem_NewGame").parent("li").addClass("disabled");
        $("#MenuItem_SelectDifficulty").parent("li").addClass("disabled");
        if (null === worker) {
            var t = new Worker("Scripts/file0x0012_WorkerRandomMap.js");
            t.onmessage = function (ev) {
                var s = (ev.data[0]);
                {
                    // transfered between different execution contexts
                    // reconstruct the objects to avoid various issues
                    var r = new ThisGame.StageState(s.width - 1, s.height - 1);
                    for (var i = 0; s.grids.length > i; ++i) {
                        r.grids[i] = s.grids[i];
                    }
                    r.departurePosition = new ThisGame.Position(s.departurePosition.direction, s.departurePosition.x, s.departurePosition.y);
                    r.destinationPosition = new ThisGame.Position(s.destinationPosition.direction, s.destinationPosition.x, s.destinationPosition.y);
                    r.currentPosition = r.departurePosition;
                    r.referenceSolution = r.solve(r.currentPosition, r.destinationPosition, -1);
                    s = r;
                }
                stageState = s;
                $("#MainForm").trigger("game.started");
            };
            if (null === worker) {
                worker = t;
            }
        }
        worker.postMessage([stageSize_width, stageSize_height, connectionRate, difficulty]);
        if (null !== hints) {
            hints.splice(0, hints.length);
        }
        generatingNewStage = true;
        graphicsBuffered = false;
        gameDataEnabled = false;
        $("#dialogWorkingOnNewStage").modal("show");
    };
    var handleGameRetry = function (ev, data) {
        gameDataEnabled = false;
        stageState.currentPosition = stageState.departurePosition;
        playerSolution = new ThisGame.TreeNode(stageState.currentPosition);
        $("#MenuItem_Undo").parent("li").addClass("disabled");
        $("#MenuItem_Redo").parent("li").addClass("disabled");
        gameDataEnabled = true;
        cursorVisible = true;
    };
    var playerSolution = null;
    var handleGameStarted = function (ev, data) {
        gameDataEnabled = true;
        playerSolution = new ThisGame.TreeNode(stageState.currentPosition);
        graphicsBuffered = false;
        generatingNewStage = false;
        cursorVisible = true;
        cursorInverted = false;
        $("#MenuItem_Retry").parent("li").removeClass("disabled");
        $("#MenuItem_Hint").parent("li").removeClass("disabled");
        $("#MenuItem_Resign").parent("li").removeClass("disabled");
        $("#dialogWorkingOnNewStage").modal("hide");
        canvas.tabIndex = 5;
        canvas.focus();
    };
    var handleGameWin = function (ev, data) {
        $('#DialogWin').modal("show");
        $("#MainForm").trigger("game.ending", { canCancel: false });
    };
    var handleGameLost = function (ev, data) {
        if (confirm("You Lost. Retry?")) {
            $("#MainForm").trigger("game.retry");
        }
        else {
            $("#MainForm").trigger("game.ending", { canCancel: false });
        }
    };
    var confirmSave = true;
    var handleGameEnding = function (ev, data) {
        $("#MenuItem_Retry").parent("li").addClass("disabled");
        $("#MenuItem_Hint").parent("li").addClass("disabled");
        $("#MenuItem_Undo").parent("li").addClass("disabled");
        $("#MenuItem_Redo").parent("li").addClass("disabled");
        $("#MenuItem_Resign").parent("li").addClass("disabled");
        cursorVisible = false;
        gameDataEnabled = false;
        if (confirmSave) {
            var b = ((ev.data && ev.data.canCancel) || (data && data["canCancel"]));
            if (b) {
                $('#DialogResign').modal('show');
            }
            else {
            }
        }
        else {
            $("#MainForm").trigger("game.ened");
        }
    };
    var handleGameEnded = function (ev, data) {
        for (var _i = 0, _a = stageState.referenceSolution.getAncestorsAndSelf(); _i < _a.length; _i++) {
            var i = _a[_i];
            hints.push(i.value);
        }
        hints.shift();
        stageState = null;
        $("#MenuItem_NewGame").parent("li").removeClass("disabled");
        $("#MenuItem_Difficulty").parent("li").removeClass("disabled");
    };
    var beepGameInvalidOperation = function (ev, data) {
        return;
    };
    var generatingNewStage = false;
    // buffer
    var context0 = null;
    $(document).ready(function () {
        stdout = document.getElementById("StdOut");
        canvas = document.getElementById("MainClient");
        context = canvas.getContext("2d");
        $("#MainForm").on("game.starting", handleGameStarting);
        $("#MainForm").on("game.retry", handleGameRetry);
        $("#MainForm").on("game.started", handleGameStarted);
        $("#MainForm").on("game.lost", handleGameLost);
        $("#MainForm").on("game.win", handleGameWin);
        $("#MainForm").on("game.ending", handleGameEnding);
        $("#MainForm").on("game.ended", handleGameEnded);
        $("#MainForm").on("game.beep", beepGameInvalidOperation);
        $(function () {
            {
                $(".navbar-default .navbar-nav").on("shown.bs.dropdown", function (ev) {
                    var a = $(".navbar-default .navbar-nav .open .dropdown-menu > li > a > span:not(.menu-shortcut)");
                    var v = -Infinity;
                    a.map(function (i, x) {
                        try {
                            var ws = $(x).css("width");
                            var w = parseFloat(ws);
                            if (w > v) {
                                v = w;
                            }
                        }
                        catch (e) {
                        }
                    });
                    if (v > -Infinity) {
                        var b = $(".navbar-default .navbar-nav .open .dropdown-menu > li > a > span.menu-shortcut").map(function (i, x) {
                            $(x).css("margin-left", 38.0 + v);
                        });
                    }
                });
            }
            {
                var m_1 = $("#MenuItem_NewGame");
                m_1.parent("li").removeClass("disabled");
                m_1.click($("#MainForm").get(0), function (e) {
                    if (!m_1.parent("li").hasClass("disabled")) {
                        $("#MainForm").trigger("game.starting");
                    }
                });
            }
            {
                var m_2 = $("#MenuItem_Retry");
                m_2.click($("#MainForm").get(0), function (e) {
                    if (!m_2.parent("li").hasClass("disabled")) {
                        $("#MainForm").trigger("game.retry");
                    }
                });
            }
            {
                var m_3 = $("#MenuItem_Redo");
                m_3.click($("#MainForm").get(0), function (e) {
                    if (!m_3.parent("li").hasClass("disabled")) {
                        if (gameDataEnabled && null !== stageState) {
                            var t_1 = playerSolution.getFirstChild();
                            stageState.currentPosition = t_1.value;
                            playerSolution = t_1;
                            if (null === t_1.getFirstChild()) {
                                $("#MenuItem_Redo").parent("li").addClass("disabled");
                            }
                            $("#MenuItem_Undo").parent("li").removeClass("disabled");
                            hints.splice(0, hints.length);
                        }
                    }
                });
            }
            {
                var m_4 = $("#MenuItem_Undo");
                m_4.click($("#MainForm").get(0), function (e) {
                    if (!m_4.parent("li").hasClass("disabled")) {
                        if (gameDataEnabled && null !== stageState) {
                            var t_2 = playerSolution.getParent();
                            stageState.currentPosition = t_2.value;
                            playerSolution = t_2;
                            if (null === t_2.getParent()) {
                                $("#MenuItem_Undo").parent("li").addClass("disabled");
                            }
                            $("#MenuItem_Redo").parent("li").removeClass("disabled");
                            hints.splice(0, hints.length);
                        }
                    }
                });
            }
            {
                var m_5 = $("#MenuItem_Resign");
                m_5.click($("#MainForm").get(0), function (e) {
                    if (!m_5.parent("li").hasClass("disabled")) {
                        $("#MainForm").trigger("game.ending", { canCancel: true });
                    }
                });
            }
            {
                var dlg_1 = $("#DialogWin");
                dlg_1.on("hide.bs.modal", function (e) {
                    if (dlg_1.hasClass("dlg-result-yes")) {
                        dlg_1.removeClass("dlg-result-yes");
                        var a = $.ajax({
                            method: "POST",
                            timeout: 5000,
                            url: "File0012_0001.cshtml?UserId=" + $("#UserId").text() + "&Score=" + (0).toString() + "&TimeStamp=" + new Date().toUTCString() + "&Secret=" + (333).toString(),
                        }).always(function (data, status, jqXHR) {
                            var s = data;
                            if (status != "success") {
                                s = jqXHR;
                            }
                            switch (s) {
                                case 0:
                                    dlg_1.modal("hide");
                                    var a_1 = jqXHR.getResponseHeader("Set-Cookie");
                                    dlg_1.find(".dlg-yes").removeClass("disabled");
                                    return;
                                case 2:
                                    dlg_1.find(".dlg-statustext").text("人工智能不認可您的登入憑據。因此，我們將不會記錄您的遊戲分數。您可以嘗試重新登入。");
                                    break;
                                case 1:
                                    dlg_1.find(".dlg-statustext").text("我們接收的資料不是正確的分數記錄。因此，我們將不會記錄您的遊戲分數。這可能有多種原因。您可以更新您的瀏覽器後重試。若問題仍然重現，請向我們反饋。");
                                    break;
                                default:
                                    dlg_1.find(".dlg-statustext").text("發生了未知錯誤。若問題重複出現，請向我們反饋。");
                            }
                            dlg_1.find(".dlg-yes").removeClass("disabled");
                        });
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        return false;
                    }
                    else if (dlg_1.hasClass("dlg-result-no")) {
                        $("#MainForm").trigger("game.ending", { canCancel: false, reason: "Win" });
                    }
                    else {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        return false;
                    }
                });
                dlg_1.on("show.bs.modal", function (e) {
                    dlg_1.removeClass("dlg-result-yes");
                    dlg_1.removeClass("dlg-result-no");
                });
                dlg_1.find(".dlg-yes").click(function (e) {
                    if (!(dlg_1.find(".dlg-yes").hasClass("disabled") || true === dlg_1.find(".dlg-yes").get(0).disabled)) {
                        dlg_1.find(".dlg-yes").addClass("disabled");
                        dlg_1.removeClass("dlg-result-yes");
                        dlg_1.removeClass("dlg-result-no");
                        dlg_1.addClass("dlg-result-yes");
                    }
                });
                dlg_1.find(".dlg-no").click(function (e) {
                    dlg_1.removeClass("dlg-result-yes");
                    dlg_1.removeClass("dlg-result-no");
                    dlg_1.addClass("dlg-result-no");
                });
            }
            {
                var dlg_2 = $("#DialogResign");
                dlg_2.on("hide.bs.modal", function (e) {
                    if (dlg_2.hasClass("dlg-result-yes")) {
                        // TODO
                        $("#MainForm").trigger("game.ended");
                    }
                    else if (dlg_2.hasClass("dlg-result-no")) {
                        $("#MainForm").trigger("game.ended");
                    }
                    else {
                        if (null !== playerSolution.getParent()) {
                            $("#MenuItem_Undo").parent("li").removeClass("disabled");
                        }
                        if (null !== playerSolution.getFirstChild()) {
                            $("#MenuItem_Redo").parent("li").removeClass("disabled");
                        }
                        $("#MenuItem_Retry").parent("li").removeClass("disabled");
                        $("#MenuItem_Hint").parent("li").removeClass("disabled");
                        $("#MenuItem_Resign").parent("li").removeClass("disabled");
                        gameDataEnabled = true;
                        cursorVisible = true;
                    }
                });
                dlg_2.on("show.bs.modal", function (e) {
                    dlg_2.removeClass("dlg-result-yes");
                    dlg_2.removeClass("dlg-result-no");
                });
                dlg_2.find(".dlg-yes").click(function (e) {
                    dlg_2.removeClass("dlg-result-yes");
                    dlg_2.removeClass("dlg-result-no");
                    dlg_2.addClass("dlg-result-yes");
                });
                dlg_2.find(".dlg-no").click(function (e) {
                    dlg_2.removeClass("dlg-result-yes");
                    dlg_2.removeClass("dlg-result-no");
                    dlg_2.addClass("dlg-result-no");
                });
            }
            {
                hints = [];
                var m_6 = $("#MenuItem_Hint");
                m_6.click($("#MainForm").get(0), function (e) {
                    if (!m_6.parent("li").hasClass("disabled")) {
                        if (gameDataEnabled && null !== stageState) {
                            if (null !== hints) {
                                // Hint enabled
                                if (0 === hints.length) {
                                    var sln = stageState.solve(stageState.currentPosition, stageState.destinationPosition, -1);
                                    if (null === sln) {
                                        var t_3 = playerSolution;
                                        while (null !== t_3.getParent()) {
                                            t_3 = t_3.getParent();
                                            if (null !== stageState.solve(t_3.value, stageState.destinationPosition, -1)) {
                                                break;
                                            }
                                        }
                                        playerSolution = t_3;
                                        stageState.currentPosition = t_3.value;
                                    }
                                    else {
                                        var s = sln.getAncestorsAndSelf();
                                        var x = Math.round(s.length * 0.61803398874989485) | 0;
                                        if (0 < x && s.length > x) {
                                            hints.push(s[x].value);
                                        }
                                    }
                                }
                                else {
                                    var sln = stageState.solve(stageState.currentPosition, hints[hints.length - 1], -1);
                                    if (null === sln) {
                                        var t_4 = playerSolution;
                                        while (null !== t_4.getParent()) {
                                            t_4 = t_4.getParent();
                                            if (null !== stageState.solve(t_4.value, stageState.destinationPosition, -1)) {
                                                break;
                                            }
                                        }
                                        playerSolution = t_4;
                                        stageState.currentPosition = t_4.value;
                                    }
                                    else {
                                        var s = sln.getAncestorsAndSelf();
                                        var x = (Math.round((s.length - 1) * 0.61803398874989485) | 0) - 1;
                                        if (0 < x && s.length - 1 > x) {
                                            hints.push(s[x].value);
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
            }
            window.addEventListener('keydown', function (e) {
                if (!(e.altKey || e.ctrlKey || e.shiftKey || e.metaKey)) {
                    if (e.keyCode === 113) {
                        $("#MenuItem_NewGame").click();
                        e.preventDefault();
                    }
                    if (gameDataEnabled && null !== stageState) {
                        var ss = stageState;
                        var sc = ss.currentPosition;
                        switch (e.keyCode) {
                            case 38:
                            case 87:
                                // Up
                                switch (sc.direction) {
                                    case ThisGame.Direction.Up:
                                        if (ThisGame.Position.equals(stageState.destinationPosition, sc)) {
                                            ss.currentPosition = new ThisGame.Position(sc.direction, sc.x, sc.y - 1);
                                            $("#MainForm").trigger("game.win");
                                            break;
                                        }
                                        else if (sc.y > 0) {
                                            ss.currentPosition = new ThisGame.Position(sc.direction, sc.x, sc.y - 1);
                                            break;
                                        }
                                        else if (0 === ((ThisGame.Connection.Down_Left | ThisGame.Connection.Down_Right) & stageState.grids[sc.x + stageState.width * sc.y])) {
                                            $("#MainForm").trigger("game.lost");
                                            break;
                                        }
                                        else {
                                            $("#MainForm").trigger("game.beep");
                                            break;
                                        }
                                    case ThisGame.Direction.Right:
                                        if (ThisGame.Connection.Up_Left === (ThisGame.Connection.Up_Left & stageState.grids[sc.x + stageState.width * sc.y])) {
                                            ss.currentPosition = new ThisGame.Position(ThisGame.Direction.Up, sc.x, sc.y - 1);
                                            break;
                                        }
                                        else {
                                            $("#MainForm").trigger("game.beep");
                                            break;
                                        }
                                    case ThisGame.Direction.Left:
                                        if (ThisGame.Connection.Up_Right === (ThisGame.Connection.Up_Right & stageState.grids[sc.x + stageState.width * sc.y])) {
                                            ss.currentPosition = new ThisGame.Position(ThisGame.Direction.Up, sc.x, sc.y - 1);
                                            break;
                                        }
                                        else {
                                            $("#MainForm").trigger("game.beep");
                                            break;
                                        }
                                    case ThisGame.Direction.Down:
                                        $("#MainForm").trigger("game.beep");
                                        break;
                                    default:
                                }
                                e.preventDefault();
                                break;
                            case 39:
                            case 68:
                                // Right
                                switch (sc.direction) {
                                    case ThisGame.Direction.Up:
                                        if (ThisGame.Connection.Down_Right === (ThisGame.Connection.Down_Right & stageState.grids[sc.x + stageState.width * sc.y])) {
                                            ss.currentPosition = new ThisGame.Position(ThisGame.Direction.Right, sc.x + 1, sc.y);
                                            break;
                                        }
                                        else {
                                            $("#MainForm").trigger("game.beep");
                                            break;
                                        }
                                    case ThisGame.Direction.Right:
                                        if (ThisGame.Position.equals(stageState.destinationPosition, sc)) {
                                            ss.currentPosition = new ThisGame.Position(sc.direction, sc.x + 1, sc.y);
                                            $("#MainForm").trigger("game.win");
                                            break;
                                        }
                                        else if (sc.x < stageState.width - 1) {
                                            ss.currentPosition = new ThisGame.Position(sc.direction, sc.x + 1, sc.y);
                                            break;
                                        }
                                        else if (0 === ((ThisGame.Connection.Up_Left | ThisGame.Connection.Down_Left) & stageState.grids[sc.x + stageState.width * sc.y])) {
                                            $("#MainForm").trigger("game.lost");
                                            break;
                                        }
                                        else {
                                            $("#MainForm").trigger("game.beep");
                                            break;
                                        }
                                    case ThisGame.Direction.Left:
                                        $("#MainForm").trigger("game.beep");
                                        break;
                                    case ThisGame.Direction.Down:
                                        if (ThisGame.Connection.Up_Right === (ThisGame.Connection.Up_Right & stageState.grids[sc.x + stageState.width * sc.y])) {
                                            ss.currentPosition = new ThisGame.Position(ThisGame.Direction.Right, sc.x + 1, sc.y);
                                            break;
                                        }
                                        else {
                                            $("#MainForm").trigger("game.beep");
                                            break;
                                        }
                                    default:
                                }
                                e.preventDefault();
                                break;
                            case 37:
                            case 65:
                                // Left
                                switch (sc.direction) {
                                    case ThisGame.Direction.Up:
                                        if (ThisGame.Connection.Down_Left === (ThisGame.Connection.Down_Left & stageState.grids[sc.x + stageState.width * sc.y])) {
                                            ss.currentPosition = new ThisGame.Position(ThisGame.Direction.Left, sc.x - 1, sc.y);
                                            break;
                                        }
                                        else {
                                            $("#MainForm").trigger("game.beep");
                                            break;
                                        }
                                    case ThisGame.Direction.Right:
                                        $("#MainForm").trigger("game.beep");
                                        break;
                                    case ThisGame.Direction.Left:
                                        if (ThisGame.Position.equals(stageState.destinationPosition, sc)) {
                                            ss.currentPosition = new ThisGame.Position(sc.direction, sc.x - 1, sc.y);
                                            $("#MainForm").trigger("game.win");
                                            break;
                                        }
                                        else if (sc.x > 0) {
                                            ss.currentPosition = new ThisGame.Position(sc.direction, sc.x - 1, sc.y);
                                            break;
                                        }
                                        else if (0 === ((ThisGame.Connection.Up_Right | ThisGame.Connection.Down_Right) & stageState.grids[sc.x + stageState.width * sc.y])) {
                                            $("#MainForm").trigger("game.lost");
                                            break;
                                        }
                                        else {
                                            $("#MainForm").trigger("game.beep");
                                            break;
                                        }
                                    case ThisGame.Direction.Down:
                                        if (ThisGame.Connection.Up_Left === (ThisGame.Connection.Up_Left & stageState.grids[sc.x + stageState.width * sc.y])) {
                                            ss.currentPosition = new ThisGame.Position(ThisGame.Direction.Left, sc.x - 1, sc.y);
                                            break;
                                        }
                                        else {
                                            $("#MainForm").trigger("game.beep");
                                            break;
                                        }
                                    default:
                                }
                                e.preventDefault();
                                break;
                            case 40:
                            case 83:
                                // Down
                                switch (sc.direction) {
                                    case ThisGame.Direction.Up:
                                        $("#MainForm").trigger("game.beep");
                                        break;
                                    case ThisGame.Direction.Right:
                                        if (ThisGame.Connection.Down_Left === (ThisGame.Connection.Down_Left & stageState.grids[sc.x + stageState.width * sc.y])) {
                                            ss.currentPosition = new ThisGame.Position(ThisGame.Direction.Down, sc.x, sc.y + 1);
                                            break;
                                        }
                                        else {
                                            $("#MainForm").trigger("game.beep");
                                            break;
                                        }
                                    case ThisGame.Direction.Left:
                                        if (ThisGame.Connection.Down_Right === (ThisGame.Connection.Down_Right & stageState.grids[sc.x + stageState.width * sc.y])) {
                                            ss.currentPosition = new ThisGame.Position(ThisGame.Direction.Down, sc.x, sc.y + 1);
                                            break;
                                        }
                                        else {
                                            $("#MainForm").trigger("game.beep");
                                            break;
                                        }
                                    case ThisGame.Direction.Down:
                                        if (ThisGame.Position.equals(stageState.destinationPosition, sc)) {
                                            ss.currentPosition = new ThisGame.Position(sc.direction, sc.x, sc.y + 1);
                                            $("#MainForm").trigger("game.win");
                                            break;
                                        }
                                        else if (sc.y < stageState.height - 1) {
                                            ss.currentPosition = new ThisGame.Position(sc.direction, sc.x, sc.y + 1);
                                            break;
                                        }
                                        else if (0 === ((ThisGame.Connection.Up_Left | ThisGame.Connection.Up_Right) & stageState.grids[sc.x + stageState.width * sc.y])) {
                                            $("#MainForm").trigger("game.lost");
                                            break;
                                        }
                                        else {
                                            $("#MainForm").trigger("game.beep");
                                            break;
                                        }
                                    default:
                                }
                                e.preventDefault();
                                break;
                            default:
                        }
                        if (!ThisGame.Position.equals(stageState.currentPosition, playerSolution.value)) {
                            if (playerSolution.isNotLeaf()) {
                                playerSolution.removeFirstChild();
                            }
                            playerSolution = playerSolution.addChild(stageState.currentPosition);
                            $("#MenuItem_Undo").parent("li").removeClass("disabled");
                            $("#MenuItem_Redo").parent("li").addClass("disabled");
                            if (hints.length > 0) {
                                hints.pop();
                            }
                        }
                    }
                }
            });
        });
        $(function () {
            var m = $("#MainMenu");
            m.css("display", "");
        });
        var canvas0 = ($("<canvas>").get(0));
        _a = [canvas.width, canvas.height], canvas0.width = _a[0], canvas0.height = _a[1];
        context0 = canvas0.getContext("2d");
        context.fillStyle = "black";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context0.fillStyle = "#000";
        context0.fillRect(0, 0, canvas0.width, canvas0.height);
        var frame_count = 0;
        var t = 0.0;
        var tc = 0.0;
        var tb = 0.0;
        var loopPerFrame = function () {
            var w = canvas.width;
            var h = canvas.height;
            {
                context.fillStyle = "black";
                context.fillRect(0.0, 0.0, w, h);
            }
            if (generatingNewStage && tb >= 0.3) {
                tb -= 0.3;
                graphicsBuffered = false;
            }
            else if (!generatingNewStage) {
                tb = 0.0;
            }
            if (!graphicsBuffered) {
                gridsContextOffset_x = 0.5 + 12.0 + (w - 24.0 - (gridSize_width + gridStrokeLineWidth) * (stageSize_width + 2) + 2 * gridStrokeLineWidth) / 2.0;
                gridsContextOffset_y = 0.5 + (12.0 + 10.0 + 3.0) + (h - 24.0 - 10.0 - 3.0 - (gridSize_height + gridStrokeLineWidth) * (stageSize_height + 2) + 2 * gridStrokeLineWidth) / 2.0;
                context0.fillStyle = "#000";
                context0.fillRect(0, 0, canvas0.width, canvas0.height);
                draw0(context0);
            }
            context.drawImage(canvas0, 0.0, 0.0, w, h);
            if (tc >= 1.0) {
                tc -= 1.0;
                cursorInverted = !cursorInverted;
            }
            // visual effect
            {
                drawCursors(context);
            }
            {
                context.textAlign = "left";
                context.fillStyle = "white";
                context.fillText(frames_per_second, 12.0, 18.0, w - 24.0);
            }
            if (generatingNewStage) {
                tb += 1.0 / 60;
            }
            tc += 1.0 / 60;
            ++frame_count;
            t += 1.0 / 60;
        };
        var frames_per_second = null;
        var loopPerSecond = function () {
            var w = canvas.width;
            var h = canvas.height;
            if (null === frames_per_second) {
                frames_per_second = "?? FPS";
            }
            else {
                frames_per_second = frame_count.toString() + " FPS";
                frame_count = 0;
            }
        };
        loopPerSecond();
        loopPerFrame();
        var timerFrame = setInterval(loopPerFrame, 1000.0 / 60);
        var timerSecond = setInterval(loopPerSecond, 1000.0);
        println("Ready.");
        var _a;
    });
});
//# sourceMappingURL=file0x0012-0.0.1.js.map