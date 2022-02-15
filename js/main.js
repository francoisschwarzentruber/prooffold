const openTabs = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1];
const tabs = new Map();
let id = undefined;

function dollarToBackSlashParenthesis(line) {
    let left = true;
    while (line.indexOf("$") > -1) {
        line = line.replace("$", left ? "\\(" : "\\)");
        left = !left;
    }
    return line;
}



function makeContainer(nodes, depth) {
    const container = document.createElement("div");
    container.classList.add("box");
    container.classList.add("box" + depth);
    for (const node of nodes)
        container.appendChild(node);
    return container;
}

function makeDiv(innerHTML) {
    const el = document.createElement("div");
    el.innerHTML = dollarToBackSlashParenthesis(innerHTML);
    return el;
}

function setInvisibleUpToDepth(depth) {
    for (let d = depth; d < 100; d++) {
        const els = document.getElementsByClassName("box" + d);
        for (let i = 0; i < els.length; i++)
            els[i].classList.add("hidden");
        //els[i].hidden = true;
    }
    for (let d = depth - 1; d < 100; d++) {
        const els = document.querySelectorAll(".box" + d + " > .on");
        for (let i = 0; i < els.length; i++)
            els[i].classList.remove("on");

    }

}



function attachReferences(domElement, references) {
    domElement.onmouseenter = () => {
        for (const ref of references) {
            if (document.getElementById(ref) == undefined)
                console.log("element " + ref + " not found!");
            document.getElementById(ref).classList.add("highlight");
        }
    };
    domElement.onmouseleave = () => {
        for (const ref of references) {
            document.getElementById(ref).classList.remove("highlight");
        }
    };
    domElement.classList.add("ref");
}



function linesToDotCode(lines) {
    let code = "";
    while (lines.length > 0) {
        const line = lines.shift().trim();
        code += line;
        if (line == "}")
            return code;
    }
    return code;
}



function linesToJS(lines) {
    let code = "";
    while (lines.length > 0) {
        const line = lines.shift();
        console.log(line)
        console.log(line.length)
        if (line.trim() == "}}")
            return code;
        code += line + "\n";
    }
    return code;
}


function linesToASCIIArt(lines) {
    let code = "";
    while (lines.length > 0) {
        const line = lines.shift();
        console.log(line)
        console.log(line.length)
        if (line.trim() == "}")
            return code;
        code += line + "\n";
    }
    return code;
}



function installEnv(line) {
    const testEnv = (str) => {
        if (line.startsWith(str)) {
            return `<env>${str}</env>` + line.substr(str.length);
        } else
            return undefined;
    }

    for (const str of ["Theorem.", "Definition.", "Proposition.", "Proof.", "Lemma."]) {
        const newLine = testEnv(str);
        if (newLine)
            return newLine;
    }
    return line;


}


function linesToDOMElement(lines, depth) {
    let nodes = [];
    while (lines.length > 0) {
        const rawLine = lines.shift();
        const line = rawLine.trim();
        const nbSpace = rawLine.length - line.length;

        if (line == "")
            continue;





        console.log(line);
        if (line.startsWith("\\newcommand")) {
            const el = document.createElement("div");
            el.innerHTML = "\\(" + line + " \\)";
            el.style.display = "none";
            document.body.append(el);
        } else if (line == "digraph {" || line == "graph {") {
            const dotCode = line + linesToDotCode(lines);
            const el = document.createElement("div");
            el.innerHTML = svgFromDot(dotCode);
            el.children[0].style.width = "100%";
            nodes.push(el);
        } else if (line == "asciiart {") {
            const content = linesToASCIIArt(lines);
            const el = document.createElement("textarea");
            el.value = content;
            el.rows = content.split("\n").length;
            el.cols = 40;
            nodes.push(el);
        } else if (line == "p5 {{") {
            /**
            
                const s = p => {
                let x = 100;
                let y = 100;

                p.setup = function() {
                    p.createCanvas(700, 410);
                };

                p.draw = function() {
                    p.background(0);
                    p.fill(255);
                    p.rect(x, y, 50, 50);
                };
                };

                new p5(s, document.getElementById("p5test")); // invoke p5
                */
            const content = linesToJS(lines);
            const el = document.createElement("div");
            document.body.append(el);
            el.id = "p5arg";
            eval("const s = p => {" + content + "}; new p5(s, document.getElementById('p5arg'))");
            el.id = "";
            nodes.push(el);
        } else if (line == "js {{") {
            const content = linesToJS(lines);
            window.eval(content);
        } else if (line == "algo {") {
            const el = linesToDOMElement(lines);
            el.classList.remove("box");
            el.classList.add("algo");
            el.style.display = "block";
            nodes.push(el);
        } else if (line == "{") {
            const box = linesToDOMElement(lines, depth + 1);
            //      box.hidden = true;
            box.classList.add("hidden");
            const ibutton = nodes.length - 1;
            const button = nodes[nodes.length - 1];
            button.classList.add("button");
            tabs.set(button, box);
            button.onclick = () => {
                let h = box.classList.contains("hidden");
                setInvisibleUpToDepth(depth + 1);

                if (h) {
                    button.classList.toggle("on");
                    box.classList.remove("hidden");

                    const previousBox = button.parentElement;
                    const previousBoxRect = previousBox.getBoundingClientRect();
                    //const previousBoxRect = previousBox.getBoundingClientRect();
                    const previousBoxRectRight = (previousBox.style.left == "" ? 0 : parseInt(previousBox.style.left)) + previousBox.offsetWidth - 3;
                    const buttonRect = button.getBoundingClientRect();
                    const boxRect = box.getBoundingClientRect();




                    /*
                    resize the box if it contains long formulae!
                    */
                    const resizeBox = (box) => {
                        let m = 400;
                        for (const el of box.children)
                            if (el.children.length > 0)
                                m = Math.max(m, el.children[0].getBoundingClientRect().width);

                        if (m > 400)
                            box.style.maxWidth = m + 5 + "px";

                    }

                    resizeBox(box);


                    //if last element + boxRect sufficiently big + there is space on the bottom of previousBox
                    const INDENT = 32;
                    if (previousBox.children[previousBox.children.length - 1] == button &&
                        boxRect.width >= previousBoxRect.width - INDENT && previousBoxRect.top + previousBoxRect.height + boxRect.height < window.innerHeight) {
                        //then put the box below (instead of on the right)
                        console.log("below")
                        box.style.left = (previousBoxRect.left + INDENT) + "px";
                        box.style.top = previousBoxRect.top + previousBoxRect.height;
                    } else {
                        box.style.left = previousBoxRectRight + "px";
                        let y = buttonRect.top - boxRect.height / 2;
                        if (y + boxRect.height > window.innerHeight)
                            y = window.innerHeight - boxRect.height;
                        if (y < 0)
                            y = 0;
                        box.style.top = y + "px";
                    }

                    setTimeout(() => document.body.scrollLeft = window.outerWidth, 500);

                    openTabs[depth] = ibutton;

                } else {
                    openTabs[depth] = -1;
                    box.classList.add("hidden");
                }
                updateURL();

            };
            document.body.appendChild(box)
        } else if (line == "}") {
            return makeContainer(nodes, depth);
        } else if (line.startsWith("\\infer1")) {
            const el = makeDiv(line.substr(7));
            el.classList.add("infer1");
            nodes.push(el);
        } else if (line == "---") {
            const el = makeDiv(line);
            el.style.textAlign = "center";
            nodes.push(el);
        } else if (line.startsWith("\\label{")) {
            nodes[nodes.length - 1].id = line.substr("\\label{".length, line.length - "\\label{".length - 1);
        } else if (line.startsWith("\\ref{"))
            attachReferences(nodes[nodes.length - 1], line.substr("\\ref{".length, line.length - "\\ref{".length - 1).split(","));

        else {
            const info = getInfoLine(line);
            console.log(info)
            info.text = installEnv(info.text);

            const el = makeDiv(info.text);
            if (info.id)
                el.id = info.id;

            if (info.text == "Example" || info.text == "Examples")
                el.classList.add("example");



            if (info.references)
                attachReferences(el, info.references);

            if (line.startsWith("Let ") || line.startsWith("Define "))
                el.classList.add("definition");

            el.style.left = nbSpace + "px";
            nodes.push(el);
        }



    }

    return makeContainer(nodes, 0);
}





function getInfoLine(line) {

    if (!line.endsWith(")"))
        return {
            text: line
        };

    let text = undefined;
    let id = undefined;
    let references = undefined;

    {
        const parenthesisIDstring = "    (";
        const i = line.lastIndexOf(parenthesisIDstring);


        if (i >= 0) {
            const j = line.indexOf(")", i);
            text = line.substr(0, i);
            id = line.substring(i + parenthesisIDstring.length, j)
        }
    }

    {
        const parenthesisRefstring = "   by (";
        const i = line.lastIndexOf(parenthesisRefstring);

        if (i >= 0) {
            references = line.substring(i + parenthesisRefstring.length, line.length - 1).split(",");
            if (!text) text = line.substr(0, i);
        } else if (!text)
            text = line;


        return {
            text: text,
            id: id,
            references: references
        };

    }


}




async function load(filename) {
    document.getElementById("menu").style.display = "none";
    const response = await fetch(`proofs/${filename}.proof`);
    const text = await response.text();

    document.body.innerHTML = "";
    const proof = linesToDOMElement(text.split("\n"), 0);

    document.body.appendChild(proof);
    MathJax.typeset();

    // format ofi .dot
}


function svgFromDot(dotCode) {
    let digraph = dotCode; // for svg
    return Viz(digraph, "svg");
}

window.onload = () => {
    document.querySelectorAll("#menu a").forEach(function (a) {
        if (a.id)
            a.href = `?id=${a.id}`;
    });

    let url = window.location.toString();
    let split = url.split('?');

    if (split.length > 1) {
        let searchParams = new URLSearchParams(split[1]);
        if (searchParams.get("id")) {
            id = searchParams.get("id");
            console.log("loading " + id)
            load(id).then(() => {
                if (searchParams.get("tabs")) {
                    const strtabs = searchParams.get("tabs");
                    let node = document.querySelectorAll(".box0")[0];
                    for (const tab of strtabs.split("/")) {
                        const i = parseInt(tab);
                        if (i < 0)
                            break;
                        console.log("open tab n°" + i)
                        node.children[i].onclick();
                        node = tabs.get(node.children[i]);
                    }

                }
            });
        }

    }

    MathJax.typeset();


}





function updateURL() {
    const url = window.location.href.split("?")[0];
    window.history.pushState({}, null, url + `?id=${id}&tabs=${openTabs.join("/")}`);
}