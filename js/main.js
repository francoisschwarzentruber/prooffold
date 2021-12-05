




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



function setInvisibleUpToDepth(depth) {
    for (let d = depth; d < 100; d++) {
        const els = document.getElementsByClassName("box" + d);
        for (let i = 0; i < els.length; i++)
            els[i].hidden = true;
    }
}
function linesToDOMElement(lines, depth) {
    let nodes = [];
    while (lines.length > 0) {
        const line = lines.shift().trim();
        if (line == "")
            continue;
        console.log(line);
        if (line == "{") {
            const box = linesToDOMElement(lines, depth + 1);
            box.hidden = true;
            const button = nodes[nodes.length - 1];
            button.classList.add("button");

            button.onclick = () => {
                let h = box.hidden;
                setInvisibleUpToDepth(depth + 1); box.hidden = !h; button.classList.toggle("on");
            };
            document.body.appendChild(box)
        }
        else if (line == "}") {
            return makeContainer(nodes, depth);
        }
        else {
            const el = document.createElement("div");
            if(nodes.length > 0)
                el.classList.add("infer1");
            el.innerHTML = dollarToBackSlashParenthesis(line);

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


