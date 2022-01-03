




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

function linesToDOMElement(lines, depth) {
    let nodes = [];
    while (lines.length > 0) {
        const rawLine = lines.shift();
        const line = rawLine.trim();
        const nbSpace = rawLine.length - line.length;

        const testEnv = (str) => {
            if (line.startsWith(str)) {
                const el = makeDiv(`<env>${str}</env>` + line.substr(str.length));
                nodes.push(el);
                return true;
            }
            else
                return false;

        }


        const testEnvs = () => {
            for (const str of ["Theorem.", "Definition.", "Proposition.", "Proof.", "Lemma."]) {
                if (testEnv(str))
                    return true;
            }
            return false;
        }

        if (line == "")
            continue;
        console.log(line);
        if (line.startsWith("\\newcommand")) {
            const el = document.createElement("div");
            el.innerHTML = "\\(" + line + " \\)";
            el.style.display = "none";
            document.body.append(el);
        }
        else if (line == "digraph {" || line == "graph {") {
            const dotCode = line + linesToDotCode(lines);
            const el = document.createElement("div");
            el.innerHTML = svgFromDot(dotCode);
            el.children[0].style.width = "100%";
            nodes.push(el);
        }
        else if (line == "asciiart {") {
            const content = linesToASCIIArt(lines);
            const el = document.createElement("textarea");
            el.value = content;
            el.rows = content.split("\n").length;
            el.cols = 40;
            nodes.push(el);
        }
        else if (line == "algo {") {
            const el = linesToDOMElement(lines);
            el.classList.remove("box");
            el.classList.add("algo");
            el.style.display = "block";
            nodes.push(el);
        }
        else if (line == "{") {
            const box = linesToDOMElement(lines, depth + 1);
            //      box.hidden = true;
            box.classList.add("hidden");
            const button = nodes[nodes.length - 1];
            button.classList.add("button");

            button.onclick = () => {
                let h = box.classList.contains("hidden");
                setInvisibleUpToDepth(depth + 1);
                //box.hidden = !h;
                if (h) {
                    button.classList.toggle("on");
                    box.classList.remove("hidden");

                    const previousBox = button.parentElement;
                    //const previousBoxRect = previousBox.getBoundingClientRect();
                    const previousBoxRectRight = (previousBox.style.left == "" ? 0 : parseInt(previousBox.style.left)) + previousBox.clientWidth - 3;
                    const buttonRect = button.getBoundingClientRect();
                    const boxRect = box.getBoundingClientRect();

                    box.style.left = previousBoxRectRight + "px";//TODO: 


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


                    if (buttonRect.top + boxRect.height / 2 < window.innerHeight) {
                        if (buttonRect.top - + boxRect.height / 2 > 0)
                            box.style.top = buttonRect.top - + boxRect.height / 2 + "px";
                        else
                            box.style.top = "0px";
                    }
                    else
                        box.style.top = "0px";

                    setTimeout(() => document.body.scrollLeft = window.outerWidth, 500);

                }
                else
                    box.classList.add("hidden");
            };
            document.body.appendChild(box)
        }
        else if (line == "}") {
            return makeContainer(nodes, depth);
        }
        else if (line.startsWith("\\infer1")) {
            const el = makeDiv(line.substr(7));
            el.classList.add("infer1");
            nodes.push(el);
        }
        else if (line == "---") {
            const el = makeDiv(line);
            el.style.textAlign = "center";
            nodes.push(el);
        }
        else if (testEnvs()) {
        }
        else if (line.startsWith("\\label{")) {
            nodes[nodes.length - 1].id = line.substr("\\label{".length, line.length - "\\label{".length - 1);
        }
        else if (line.startsWith("\\ref{"))
            attachReferences(nodes[nodes.length - 1], line.substr("\\ref{".length, line.length - "\\ref{".length - 1).split(","));

        else {
            const info = getInfoLine(line);
            console.log(info)
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
        return { text: line };

    const parenthesisIDstring = "   (";
    const i = line.lastIndexOf(parenthesisIDstring);

    if (i >= 0) {
        return { text: line.substr(0, i), id: line.substring(i + parenthesisIDstring.length, line.length - 1) };
    }
    else {
        const parenthesisRefstring = "   by (";
        const i = line.lastIndexOf(parenthesisRefstring);

        if (i >= 0)
            return { text: line.substr(0, i), references: line.substring(i + parenthesisRefstring.length, line.length - 1).split(",") };
        else
            return { text: line };

    }


}




async function load(filename) {
    document.getElementById("menu").style.display = "none";
    const response = await fetch(`proofs/${filename}.proof`);
    const text = await response.text();

    const proof = linesToDOMElement(text.split("\n"), 0);
    document.getElementById("proof").innerHTML = "";
    document.getElementById("proof").appendChild(proof);
    MathJax.typeset();

    // format ofi .dot
}


function svgFromDot(dotCode) {
    let digraph = dotCode;// for svg
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
            const id = searchParams.get("id");
            console.log("loading " + id)
            load(id);
        }
    }

    MathJax.typeset();

}


