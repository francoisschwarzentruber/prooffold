




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

function linesToDOMElement(lines, depth) {
    let nodes = [];
    while (lines.length > 0) {
        const line = lines.shift().trim();

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
        if (line == "{") {
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
            const el = makeDiv(line);
            nodes.push(el);
        }



    }

    return makeContainer(nodes, 0);
}



async function load(filename) {
    document.getElementById("menu").style.display = "none";
    const response = await fetch(`proofs/${filename}.proof`);
    const text = await response.text();

    const proof = linesToDOMElement(text.split("\n").map((line) => line.trim()), 0);
    document.getElementById("proof").innerHTML = "";
    document.getElementById("proof").appendChild(proof);
    MathJax.typeset();
}

window.onload = () => {
    document.querySelectorAll("#menu a").forEach(function (a) {
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


