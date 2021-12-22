# prooffold
This repository contains a tool for reading/studying mathematical proofs. It tries to solve two main issues of traditional proofs written in a book:
- the global organization of a proof in a textbook is often not very clear. This is due to the linearity of a textual proof. Here, the proof is displayed in panels, making an emphasis on the structure of the proof
- In a textbook, justifications of a statement often ends up "by Theorem 1.2.3, Lemma 42.4 and Corollary 8.8.4 and Equation 1". Here, by clicking on a statement, the arguments used to deduced that fact are highlighted.

The tool is available here: https://francoisschwarzentruber.github.io/prooffold/

# Writing proofs

Proofs are easy to be written. 

      Fact
      Theorem. $a^2 = b^2 + c^2$.
            {
              write the proof of the theorem
              with an amazing fact       (1)
              {
                 proof of that amazing fact
              }
              we have that         (2)
              Thus we have bling       by (1,2)
            }
      Another Fact
      
      
Each line is a fact, or simple text. Blocks (panels) are delimited by `{` and `}` and corresponds to a detailed proof of some fact. `     (1)`, `   (2)` etc. and `      by (1,2)` enable to highlight some facts used to prove another fact.



# Features
  [X] LaTEX for writing formulas 
  [X] Structured proof
  [X] Labels [(1) (2)] and references [by (1,2)]
  [X] inline graphs via graphviz
  [~] Asciiart (soon via https://github.com/francoisschwarzentruber/asciidraw)
  [ ] Arrows of implications
  [ ] Automatic aligned equations


# How to contribute?

Adding new proofs! Also discussing about how to improve the way to display proofs.
