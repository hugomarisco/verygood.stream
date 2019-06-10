import { ErrorMessage, Field, Formik } from "formik";
import { inject, observer } from "mobx-react";
import { hideVisually, rgba } from "polished";
import React from "react";
import { Button } from "../../components/Button";
import { Fieldset } from "../../components/Fieldset";
import { Flex } from "../../components/Flex";
import { H4 } from "../../components/H4";
import { PlusIcon, SoccerBallIcon } from "../../components/Icon";
import { Input } from "../../components/Input";
import { Label } from "../../components/Label";
import { Legend } from "../../components/Legend";
import { P } from "../../components/P";
import { Spacer } from "../../components/Spacer";
import { TopNav } from "../../components/TopNav";
import { StreamStore } from "../../stores/StreamStore";
import { css, styled } from "../../utils/theme";

interface IPosterPanel {
  posterUrl?: string;
}

const PosterPanel = styled.div<IPosterPanel>`
  background: ${props =>
    props.posterUrl
      ? `url(${props.posterUrl})`
      : rgba(props.theme.colors.white, 0.1)};
  background-size: cover;
  background-position: center center;
  padding: 40px;
  height: 260px;
`;

interface IHighlightableIcon {
  checked: boolean;
}

const HighlightableIcon = styled.span<IHighlightableIcon>`
  background: ${props =>
    props.checked
      ? props.theme.colors.bloodyOrange
      : rgba(props.theme.colors.white, 0.1)};
  padding: 40px;
  border-radius: 70px;
  display: inline-block;
`;

interface IEditStreamProps {
  streamStore: StreamStore;
}

interface IEditStreamState {
  category: number | undefined;
}

@inject("streamStore")
@observer
export class EditStream extends React.Component<
  IEditStreamProps,
  IEditStreamState
> {
  public state = {
    category: undefined
  };

  public componentDidMount() {
    this.props.streamStore.fetch("2034171750778085465");
  }

  public render() {
    if (!this.props.streamStore.stream) {
      return null;
    }

    debugger;
    return (
      <div>
        <TopNav />

        <H4>CUSTOMIZE YOUR STREAM</H4>

        <Spacer layout size="l" />

        <Formik
          initialValues={{
            category_id: "",
            poster: "",
            title: this.props.streamStore.stream!.title
          }}
          validate={values => ({})}
          onSubmit={(values, { setSubmitting }) => {
            setTimeout(() => {
              alert(JSON.stringify(values, null, 2));
              setSubmitting(false);
            }, 400);
          }}
        >
          {({ handleSubmit, isSubmitting, values, setFieldValue }) => (
            <form onSubmit={handleSubmit}>
              <Fieldset>
                <Label htmlFor="title">Stream Title</Label>

                <Field
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Type your stream title"
                  component={Input}
                />

                <ErrorMessage name="title" />
              </Fieldset>

              <Fieldset>
                <Legend>Category</Legend>

                <Flex
                  css={`
                    overflow-x: auto;
                  `}
                >
                  {[
                    { id: 1, label: "Soccer" },
                    { id: 2, label: "Gaming" },
                    { id: 3, label: "Basketball" },
                    { id: 4, label: "Basketball" }
                  ].map(category => (
                    <React.Fragment key={category.id}>
                      <Field
                        type="radio"
                        name="category_id"
                        css={`
                          ${hideVisually()}
                        `}
                        id={`category-${category.id}`}
                        value={category.id}
                      />

                      <div
                        css={`
                          margin-right: 40px;
                          text-align: center;
                        `}
                      >
                        <Label htmlFor={`category-${category.id}`}>
                          <HighlightableIcon
                            checked={
                              values.category_id === category.id.toString()
                            }
                          >
                            <SoccerBallIcon
                              css={`
                                display: block;
                              `}
                            />
                          </HighlightableIcon>

                          <Spacer size="l" />
                          <P
                            translucent={
                              values.category_id !== category.id.toString()
                            }
                          >
                            {category.label}
                          </P>
                        </Label>
                      </div>
                    </React.Fragment>
                  ))}
                </Flex>

                <ErrorMessage name="category_id" />
              </Fieldset>

              <Fieldset>
                <Legend>Poster image</Legend>

                <input
                  type="file"
                  id="poster"
                  name="poster"
                  css={`
                    ${hideVisually()}
                  `}
                  onChange={ev =>
                    ev.currentTarget.files &&
                    setFieldValue(
                      "poster",
                      URL.createObjectURL(ev.currentTarget.files[0])
                    )
                  }
                />

                <Label htmlFor={`poster`}>
                  <PosterPanel posterUrl={values.poster}>
                    <span
                      css={css`
                        background: ${props => props.theme.colors.bloodyOrange};
                        padding: 8px;
                        border-radius: 20px;
                        display: inline-block;
                      `}
                    >
                      <PlusIcon
                        css={`
                          display: block;
                        `}
                      />
                    </span>
                    <P translucent>Upload image</P>
                    <P translucent>(1080x720)</P>
                  </PosterPanel>
                </Label>

                <ErrorMessage name="poster" />
              </Fieldset>

              <Button type="submit" disabled={isSubmitting}>
                Start Streaming
              </Button>
            </form>
          )}
        </Formik>
      </div>
    );
  }
}
