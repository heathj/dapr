import styled from "styled-components";

export const OverflowDiv = styled.div`
  height: 100vh;
  overflow-y: scroll;
  overflow-x: hidden;
`;

export const WidthComponent = (comp: any, width: number) => styled(comp)`
  width: ${width}px;
`;

export const ProcessColumn = WidthComponent(OverflowDiv, 250);
