import React from "react";
import Typography from "@material-ui/core/Typography";
import styled from "styled-components";

const Answer = ({
  prefix,
  content,
  selected = false,
  onClick,
  valid = false,
  id,
  shouldRevealValidity = false,
}) => {
  return (
    <Root
      color="textSecondary"
      valid={valid.toString()}
      reveal={shouldRevealValidity.toString()}
      gutterBottom
      selected={selected}
      onClick={() => onClick({ id, shouldSelect: !selected })}
    >
      {prefix}. {content}
    </Root>
  );
};

const Root = styled(Typography)`
  && {
    cursor: pointer;
    padding: 15px;
    margin-bottom: 0px;
    width: 100%;
    background-color: ${(props) => {
      const valid = props.valid === "true";
      const reveal = props.reveal === "true";
      const { selected } = props;

      if (reveal) {
        if (selected) {
          return valid ? "#23DC3D" : "#F08080";
        } else {
          if (valid) {
            return "#FFEFD5";
          }
        }
      } else if (selected) {
        return "#d4ebf2";
      }
    }};
  }
`;

export default Answer;
