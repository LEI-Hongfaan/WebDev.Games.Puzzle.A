"use strict";

$(function () {
    "use strict";
    console.log("file0x0012-0.0.1");
    let stdout = <HTMLElement>null;
    let canvas = <HTMLCanvasElement>null;
    let context = <CanvasRenderingContext2D>null;
    let println = function (str: string) {
        $("<div>").text(str).appendTo(stdout);
    };
    let stageState = <ThisGame.StageState>null;
    // graphics parameters
    let defaultGridSizeParameter = 21.0;
    let defaultGridStrokeLineWidth = 13.0;
    let defaultCursorFillStyle = "#FF00FF";
    let defaultCursorInvertedFillStyle = "#40C040";
    let defaultCursorStrokeWidth = defaultGridStrokeLineWidth;

    let gridSizeParameter: number;
    let gridSize_width, gridSize_height: number;
    let getGridSizeParameter = function () {
        return gridSizeParameter;
    };
    let setGridSizeParameter = function (value: number) {
        if (value < 1) {
            value = 1;
        }
        [gridSizeParameter, gridSize_width, gridSize_height] = [value, 3.0 * value, 3.0 * value];
    };
    setGridSizeParameter(defaultGridSizeParameter);

    let gridStrokeLineWidth = defaultGridStrokeLineWidth;
    let cursorFillStyle = defaultCursorFillStyle;
    let cursorInvertedFillStyle = defaultCursorInvertedFillStyle;
    let cursorStrokeWidth = defaultCursorStrokeWidth;

    let stageSize_width, stageSize_height: number;
    // game parameters
    stageSize_width = 6;
    stageSize_height = 6;

    // TODO: review
    let defaultDifficulty = 4.0;

    let difficulty = defaultDifficulty;

    let defaultConnectionRate = 1.0 / 4.0;

    let connectionRate = defaultConnectionRate;

    let graphicsBuffered = false;
    let gridsContextOffset_x, gridsContextOffset_y: number;

    gridsContextOffset_x = 0.5 + 12.0;
    gridsContextOffset_y = 0.5 + 12.0 + 10.0 + 3.0;

    let drawGridsLines = function (context: CanvasRenderingContext2D) {
        let x, y: number;
        let s = gridStrokeLineWidth;
        let [w, h] = [stageSize_width, stageSize_height];
        let [dx, dy] = [gridSize_width, gridSize_height];
        context.strokeStyle = '#FFFFFF';
        context.fillStyle = '#FFFFFF';
        context.lineWidth = s;
        y = dy + s / 2.0 + gridsContextOffset_y;
        for (let m = 1; m <= h; ++m) {
            x = dx + s / 2.0 + gridsContextOffset_x;
            for (let n = 1; n <= w; ++n) {
                context.strokeRect(x - s / 2.0, y - s / 2.0, dx + s, dy + s);
                x += dx + s;
            }
            y += dy + s;
        }
    };

    let toContextLocation = function (m: number, n: number): [number, number] {
        return [(m + 1) * gridSize_width + gridStrokeLineWidth * m, (n + 1) * gridSize_height + gridStrokeLineWidth * n];
    }

    let drawGridsConnection = function (context: CanvasRenderingContext2D, m: number, n: number, c: ThisGame.Connection) {
        let [x, y] = toContextLocation(m, n);
        let [w, h] = [(gridSize_width + gridStrokeLineWidth * 2.0) / 3.0, (gridSize_height + gridStrokeLineWidth * 2.0) / 3.0];
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

    let drawGridsConnections = function (context: CanvasRenderingContext2D, grids: Int8Array, w: number, h: number) {
        context.lineWidth = gridStrokeLineWidth;
        for (let n = 0; h > n; ++n) {
            for (let m = 0; w > m; ++m) {
                let c = grids[m + w * n];
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

    let toCursorPolygonPoints = function (position: ThisGame.Position): Array<number> {
        let a = new Array<number>(12);
        let s = (gridStrokeLineWidth + 1.0) / 2.0;
        let sh = cursorStrokeWidth + (s + 1.0) / 2.0;
        let st = sh * 3.0 / 2.0;
        let [x, y] = toContextLocation(position.x, position.y);
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

    let drawCursor = function (context: CanvasRenderingContext2D, position: ThisGame.Position, fillStyle: string | CanvasGradient | CanvasPattern) {
        let p = toCursorPolygonPoints(position);
        context.fillStyle = fillStyle;
        context.beginPath();
        context.moveTo(p[0], p[1]);
        for (let i = 3; p.length > i; i += 2) {
            context.lineTo(p[i - 1], p[i]);
        }
        context.fill();
    };

    let hints = <Array<ThisGame.Position>>null;
    let cursorVisible = false;
    let cursorInverted = false;

    let drawCursors = function (context: CanvasRenderingContext2D) {
        if (null !== hints) {
            for (let i of hints) {
                drawCursor(context, i, '#FFD700');
            }
        }
        if (cursorVisible) {
            drawCursor(context, stageState.currentPosition, cursorInverted ? cursorInvertedFillStyle : cursorFillStyle);
        }
    };

    let draw0 = function (context: CanvasRenderingContext2D) {
        drawGridsLines(context);
        if (null === stageState) {
            let s = new ThisGame.StageState(stageSize_width, stageSize_height);
            s.randomize(connectionRate);
            drawGridsConnections(context, s.grids, 1 + stageSize_width, 1 + stageSize_height);
        } else {
            drawGridsConnections(context, stageState.grids, stageState.width, stageState.height);
            drawCursor(context, stageState.departurePosition, '#800080');
            {
                let dst = stageState.destinationPosition;
                let [d, x, y] = [dst.direction, dst.x, dst.y];
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

    let gameDataEnabled = false;

    let worker = <Worker>null;

    let handleGameStarting = function (ev: JQueryEventObject, data?: Object | any[]) {
        $("#MenuItem_NewGame").parent("li").addClass("disabled");
        $("#MenuItem_SelectDifficulty").parent("li").addClass("disabled");
        if (null === worker) {
            let t = new Worker("Scripts/file0x0012_WorkerRandomMap.js");
            t.onmessage = function (ev) {
                let s = <ThisGame.StageState>(ev.data[0]);
                {
                    // transfered between different execution contexts
                    // reconstruct the objects to avoid various issues
                    let r = new ThisGame.StageState(s.width - 1, s.height - 1);
                    for (let i = 0; s.grids.length > i; ++i) {
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

    let handleGameRetry = function (ev: JQueryEventObject, data?: Object | any[]) {
        gameDataEnabled = false;
        stageState.currentPosition = stageState.departurePosition;
        playerSolution = new ThisGame.TreeNode(stageState.currentPosition);
        $("#MenuItem_Undo").parent("li").addClass("disabled");
        $("#MenuItem_Redo").parent("li").addClass("disabled");

        gameDataEnabled = true;
        cursorVisible = true;
    };

    let playerSolution = <ThisGame.TreeNode<ThisGame.Position>>null;

    let handleGameStarted = function (ev: JQueryEventObject, data?: Object | any[]) {
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

    let handleGameWin = function (ev: JQueryEventObject, data?: Object | any[]) {
        $('#DialogWin').modal("show");
        $("#MainForm").trigger("game.ending", { canCancel: false });
    };

    let handleGameLost = function (ev: JQueryEventObject, data?: Object | any[]) {
        if (confirm("You Lost. Retry?")) {
            $("#MainForm").trigger("game.retry");
        } else {
            $("#MainForm").trigger("game.ending", { canCancel: false });
        }
    };

    let confirmSave = true;

    let handleGameEnding = function (ev: JQueryEventObject, data?: Object | any[]) {
        $("#MenuItem_Retry").parent("li").addClass("disabled");
        $("#MenuItem_Hint").parent("li").addClass("disabled");
        $("#MenuItem_Undo").parent("li").addClass("disabled");
        $("#MenuItem_Redo").parent("li").addClass("disabled");
        $("#MenuItem_Resign").parent("li").addClass("disabled");
        cursorVisible = false;
        gameDataEnabled = false;
        if (confirmSave) {
            let b = <boolean>((ev.data && ev.data.canCancel) || (data && data["canCancel"]));
            if (b) {
                $('#DialogResign').modal('show');
            } else {

            }
        } else {
            $("#MainForm").trigger("game.ened");
        }
    };

    let handleGameEnded = function (ev: JQueryEventObject, data?: Object | any[]) {
        for (let i of stageState.referenceSolution.getAncestorsAndSelf()) {
            hints.push(i.value);
        }
        hints.shift();
        stageState = null;
        $("#MenuItem_NewGame").parent("li").removeClass("disabled");
        $("#MenuItem_Difficulty").parent("li").removeClass("disabled");
    };

    let beepGameInvalidOperation = function (ev: JQueryEventObject, data?: Object | any[]) {
        return;
    };


    let generatingNewStage = false;

    // buffer
    let context0 = <CanvasRenderingContext2D>null;



    $(document).ready(function () {
        stdout = <HTMLDivElement>document.getElementById("StdOut");
        canvas = <HTMLCanvasElement>document.getElementById("MainClient");
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
                    let a = $(".navbar-default .navbar-nav .open .dropdown-menu > li > a > span:not(.menu-shortcut)");
                    let v = -Infinity;
                    a.map(function (i, x) {
                        try {
                            let ws = $(x).css("width");
                            let w = parseFloat(ws);
                            if (w > v) {
                                v = w;
                            }
                        } catch (e) {
                        }
                    });
                    if (v > -Infinity) {
                        let b = $(".navbar-default .navbar-nav .open .dropdown-menu > li > a > span.menu-shortcut").map(function (i, x) {
                            $(x).css("margin-left", 38.0 + v);
                        });
                    }
                });
            }
            {
                let m = $("#MenuItem_NewGame");
                m.parent("li").removeClass("disabled");
                m.click($("#MainForm").get(0), function (e) {
                    if (!m.parent("li").hasClass("disabled")) {
                        $("#MainForm").trigger("game.starting");
                    }
                });
            }
            {
                let m = $("#MenuItem_Retry");
                m.click($("#MainForm").get(0), function (e) {
                    if (!m.parent("li").hasClass("disabled")) {
                        $("#MainForm").trigger("game.retry");
                    }
                });
            }
            {
                let m = $("#MenuItem_Redo");
                m.click($("#MainForm").get(0), function (e) {
                    if (!m.parent("li").hasClass("disabled")) {
                        if (gameDataEnabled && null !== stageState) {
                            let t = playerSolution.getFirstChild();
                            stageState.currentPosition = t.value;
                            playerSolution = t;
                            if (null === t.getFirstChild()) {
                                $("#MenuItem_Redo").parent("li").addClass("disabled");
                            }
                            $("#MenuItem_Undo").parent("li").removeClass("disabled");
                            hints.splice(0, hints.length);
                        }
                    }
                });
            }
            {
                let m = $("#MenuItem_Undo");
                m.click($("#MainForm").get(0), function (e) {
                    if (!m.parent("li").hasClass("disabled")) {
                        if (gameDataEnabled && null !== stageState) {
                            let t = playerSolution.getParent();
                            stageState.currentPosition = t.value;
                            playerSolution = t;
                            if (null === t.getParent()) {
                                $("#MenuItem_Undo").parent("li").addClass("disabled");
                            }
                            $("#MenuItem_Redo").parent("li").removeClass("disabled");
                            hints.splice(0, hints.length);
                        }
                    }
                });
            }
            {
                let m = $("#MenuItem_Resign");
                m.click($("#MainForm").get(0), function (e) {
                    if (!m.parent("li").hasClass("disabled")) {
                        $("#MainForm").trigger("game.ending", { canCancel: true });
                    }
                });
            }
            {
                let dlg = $("#DialogWin");
                dlg.on("hide.bs.modal", function (e) {
                    if (dlg.hasClass("dlg-result-yes")) {
                        dlg.removeClass("dlg-result-yes");
                        let a = $.ajax({
                            method: "POST",
                            timeout: 5000,
                            url: "File0012_0001.cshtml?UserId=" + $("#UserId").text() + "&Score=" + (0).toString() + "&TimeStamp=" + new Date().toUTCString() + "&Secret=" + (333).toString(),
                        }).always(function (data, status, jqXHR) {
                            let s = data;
                            if (status != "success") {
                                s = jqXHR;
                            }
                            switch (s) {
                                case 0:
                                    dlg.modal("hide");
                                    let a = jqXHR.getResponseHeader("Set-Cookie");
                                    dlg.find(".dlg-yes").removeClass("disabled");
                                    return;
                                case 2:
                                    dlg.find(".dlg-statustext").text("人工智能不認可您的登入憑據。因此，我們將不會記錄您的遊戲分數。您可以嘗試重新登入。");
                                    break;
                                case 1:
                                    dlg.find(".dlg-statustext").text("我們接收的資料不是正確的分數記錄。因此，我們將不會記錄您的遊戲分數。這可能有多種原因。您可以更新您的瀏覽器後重試。若問題仍然重現，請向我們反饋。");
                                    break;
                                default:
                                    dlg.find(".dlg-statustext").text("發生了未知錯誤。若問題重複出現，請向我們反饋。");
                            }
                            dlg.find(".dlg-yes").removeClass("disabled");
                        });
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        return false;
                    } else if (dlg.hasClass("dlg-result-no")) {
                        $("#MainForm").trigger("game.ending", { canCancel: false, reason: "Win" });
                    } else {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        return false;
                    }
                });
                dlg.on("show.bs.modal", function (e) {
                    dlg.removeClass("dlg-result-yes");
                    dlg.removeClass("dlg-result-no");
                });
                dlg.find(".dlg-yes").click(function (e) {
                    if (!(dlg.find(".dlg-yes").hasClass("disabled") || true === (<HTMLButtonElement>dlg.find(".dlg-yes").get(0)).disabled)) {
                        dlg.find(".dlg-yes").addClass("disabled");
                        dlg.removeClass("dlg-result-yes");
                        dlg.removeClass("dlg-result-no");
                        dlg.addClass("dlg-result-yes");
                    }
                });
                dlg.find(".dlg-no").click(function (e) {
                    dlg.removeClass("dlg-result-yes");
                    dlg.removeClass("dlg-result-no");
                    dlg.addClass("dlg-result-no");
                });
            }
            {
                let dlg = $("#DialogResign");
                dlg.on("hide.bs.modal", function (e) {
                    if (dlg.hasClass("dlg-result-yes")) {
                        // TODO
                        $("#MainForm").trigger("game.ended");
                    } else if (dlg.hasClass("dlg-result-no")) {
                        $("#MainForm").trigger("game.ended");
                    } else {
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
                dlg.on("show.bs.modal", function (e) {
                    dlg.removeClass("dlg-result-yes");
                    dlg.removeClass("dlg-result-no");
                });
                dlg.find(".dlg-yes").click(function (e) {
                    dlg.removeClass("dlg-result-yes");
                    dlg.removeClass("dlg-result-no");
                    dlg.addClass("dlg-result-yes");
                });
                dlg.find(".dlg-no").click(function (e) {
                    dlg.removeClass("dlg-result-yes");
                    dlg.removeClass("dlg-result-no");
                    dlg.addClass("dlg-result-no");
                });
            }
            {
                hints = [];
                let m = $("#MenuItem_Hint");
                m.click($("#MainForm").get(0), function (e) {
                    if (!m.parent("li").hasClass("disabled")) {
                        if (gameDataEnabled && null !== stageState) {
                            if (null !== hints) {
                                // Hint enabled
                                if (0 === hints.length) {
                                    let sln = stageState.solve(stageState.currentPosition, stageState.destinationPosition, -1);
                                    if (null === sln) {
                                        let t = playerSolution;
                                        while (null !== t.getParent()) {
                                            t = t.getParent();
                                            if (null !== stageState.solve(t.value, stageState.destinationPosition, -1)) {
                                                break;
                                            }
                                        }
                                        playerSolution = t;
                                        stageState.currentPosition = t.value;
                                    } else {
                                        let s = sln.getAncestorsAndSelf();
                                        let x = Math.round(s.length * 0.61803398874989485) | 0;
                                        if (0 < x && s.length > x) {
                                            hints.push(s[x].value);
                                        }
                                    }
                                } else {
                                    let sln = stageState.solve(stageState.currentPosition, hints[hints.length - 1], -1);
                                    if (null === sln) {
                                        let t = playerSolution;
                                        while (null !== t.getParent()) {
                                            t = t.getParent();
                                            if (null !== stageState.solve(t.value, stageState.destinationPosition, -1)) {
                                                break;
                                            }
                                        }
                                        playerSolution = t;
                                        stageState.currentPosition = t.value;
                                    } else {
                                        let s = sln.getAncestorsAndSelf();
                                        let x = (Math.round((s.length - 1) * 0.61803398874989485) | 0) - 1;
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
                        let ss = stageState;
                        let sc = ss.currentPosition;

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
                                        } else if (sc.y > 0) {
                                            ss.currentPosition = new ThisGame.Position(sc.direction, sc.x, sc.y - 1);
                                            break;
                                        } else if (0 === ((ThisGame.Connection.Down_Left | ThisGame.Connection.Down_Right) & stageState.grids[sc.x + stageState.width * sc.y])) {
                                            $("#MainForm").trigger("game.lost");
                                            break;
                                        } else {
                                            $("#MainForm").trigger("game.beep");
                                            break;
                                        }
                                    case ThisGame.Direction.Right:
                                        if (ThisGame.Connection.Up_Left === (ThisGame.Connection.Up_Left & stageState.grids[sc.x + stageState.width * sc.y])) {
                                            ss.currentPosition = new ThisGame.Position(ThisGame.Direction.Up, sc.x, sc.y - 1);
                                            break;
                                        } else {
                                            $("#MainForm").trigger("game.beep");
                                            break;
                                        }
                                    case ThisGame.Direction.Left:
                                        if (ThisGame.Connection.Up_Right === (ThisGame.Connection.Up_Right & stageState.grids[sc.x + stageState.width * sc.y])) {
                                            ss.currentPosition = new ThisGame.Position(ThisGame.Direction.Up, sc.x, sc.y - 1);
                                            break;
                                        } else {
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
                                        } else {
                                            $("#MainForm").trigger("game.beep");
                                            break;
                                        }
                                    case ThisGame.Direction.Right:
                                        if (ThisGame.Position.equals(stageState.destinationPosition, sc)) {
                                            ss.currentPosition = new ThisGame.Position(sc.direction, sc.x + 1, sc.y);
                                            $("#MainForm").trigger("game.win");
                                            break;
                                        } else if (sc.x < stageState.width - 1) {
                                            ss.currentPosition = new ThisGame.Position(sc.direction, sc.x + 1, sc.y);
                                            break;
                                        } else if (0 === ((ThisGame.Connection.Up_Left | ThisGame.Connection.Down_Left) & stageState.grids[sc.x + stageState.width * sc.y])) {
                                            $("#MainForm").trigger("game.lost");
                                            break;
                                        } else {
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
                                        } else {
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
                                        } else {
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
                                        } else if (sc.x > 0) {
                                            ss.currentPosition = new ThisGame.Position(sc.direction, sc.x - 1, sc.y);
                                            break;
                                        } else if (0 === ((ThisGame.Connection.Up_Right | ThisGame.Connection.Down_Right) & stageState.grids[sc.x + stageState.width * sc.y])) {
                                            $("#MainForm").trigger("game.lost");
                                            break;
                                        } else {
                                            $("#MainForm").trigger("game.beep");
                                            break;
                                        }
                                    case ThisGame.Direction.Down:
                                        if (ThisGame.Connection.Up_Left === (ThisGame.Connection.Up_Left & stageState.grids[sc.x + stageState.width * sc.y])) {
                                            ss.currentPosition = new ThisGame.Position(ThisGame.Direction.Left, sc.x - 1, sc.y);
                                            break;
                                        } else {
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
                                        } else {
                                            $("#MainForm").trigger("game.beep");
                                            break;
                                        }
                                    case ThisGame.Direction.Left:
                                        if (ThisGame.Connection.Down_Right === (ThisGame.Connection.Down_Right & stageState.grids[sc.x + stageState.width * sc.y])) {
                                            ss.currentPosition = new ThisGame.Position(ThisGame.Direction.Down, sc.x, sc.y + 1);
                                            break;
                                        } else {
                                            $("#MainForm").trigger("game.beep");
                                            break;
                                        }
                                    case ThisGame.Direction.Down:
                                        if (ThisGame.Position.equals(stageState.destinationPosition, sc)) {
                                            ss.currentPosition = new ThisGame.Position(sc.direction, sc.x, sc.y + 1);
                                            $("#MainForm").trigger("game.win");
                                            break;
                                        } else if (sc.y < stageState.height - 1) {
                                            ss.currentPosition = new ThisGame.Position(sc.direction, sc.x, sc.y + 1);
                                            break;
                                        } else if (0 === ((ThisGame.Connection.Up_Left | ThisGame.Connection.Up_Right) & stageState.grids[sc.x + stageState.width * sc.y])) {
                                            $("#MainForm").trigger("game.lost");
                                            break;
                                        } else {
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
            let m = $("#MainMenu");
            m.css("display", "");
        });





        let canvas0 = <HTMLCanvasElement>($("<canvas>").get(0));
        [canvas0.width, canvas0.height] = [canvas.width, canvas.height];
        context0 = canvas0.getContext("2d");

        context.fillStyle = "black";
        context.fillRect(0, 0, canvas.width, canvas.height);

        context0.fillStyle = "#000";
        context0.fillRect(0, 0, canvas0.width, canvas0.height);

        let frame_count = 0;
        let t = 0.0;
        let tc = 0.0;
        let tb = 0.0;

        let loopPerFrame = function () {
            let w = canvas.width;
            let h = canvas.height;
            {
                context.fillStyle = "black";
                context.fillRect(0.0, 0.0, w, h);
            }

            if (generatingNewStage && tb >= 0.3) {
                tb -= 0.3;
                graphicsBuffered = false;
            } else if (!generatingNewStage) {
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
        let frames_per_second = <string>null;
        let loopPerSecond = function () {
            let w = canvas.width;
            let h = canvas.height;
            if (null === frames_per_second) {
                frames_per_second = "?? FPS";
            } else {
                frames_per_second = frame_count.toString() + " FPS";
                frame_count = 0;
            }
        };
        loopPerSecond();
        loopPerFrame();
        let timerFrame = setInterval(loopPerFrame, 1000.0 / 60);
        let timerSecond = setInterval(loopPerSecond, 1000.0);

        println("Ready.");
    });
});