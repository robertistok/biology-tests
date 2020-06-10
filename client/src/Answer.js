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
      env={process.env.NODE_ENV}
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
    margin: 1px 0px;
    box-shadow: 0 1px 3px -3px black;

    text-decoration: ${(props) =>
      props.env === "development" && props.valid === "true"
        ? "underline"
        : "initial"};

    background-color: ${(props) => {
      const valid = props.valid === "true";
      const reveal = props.reveal === "true";
      const { selected } = props;

      if (reveal) {
        if (selected) {
          return valid ? "#23DC3D" : "#F08080";
        } else {
          if (valid) {
            return "#FF8C00";
          }
        }
      } else if (selected) {
        return "#d4ebf2";
      }
    }};
  }
`;

export default Answer;
