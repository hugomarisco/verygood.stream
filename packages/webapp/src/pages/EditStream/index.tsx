import { ErrorMessage, Field, Formik } from "formik";
import { inject, observer } from "mobx-react";
import { hideVisually } from "polished";
import React from "react";
import { Button } from "../../components/Button";
import { Column } from "../../components/Column";
import { Container } from "../../components/Container";
import { Fieldset } from "../../components/Fieldset";
import { PlusIcon, SoccerBallIcon } from "../../components/Icon";
import { Input } from "../../components/Input";
import { Label } from "../../components/Label";
import { Legend } from "../../components/Legend";
import { P } from "../../components/P";
import { Row } from "../../components/Row";
import { TopNav } from "../../components/TopNav";
import { StreamStore } from "../../stores/StreamStore";
import { css } from "../../utils/theme";
import {
  CategoriesContainer,
  CategoryLabel,
  HighlightableIcon,
  PageTitle,
  PosterLabel
} from "./styles";

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

    return (
      <Container>
        <TopNav />

        <Row>
          <Column />
          <Column span={10}>
            <PageTitle>
              CUSTOMIZE
              <br />
              YOUR STREAM
            </PageTitle>
          </Column>
        </Row>

        <Formik
          initialValues={{
            category_id: this.props.streamStore.stream!.category_id,
            poster_path: this.props.streamStore.stream!.poster_path,
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
              <Row>
                <Column />
                <Column span={10}>
                  <Fieldset>
                    <Label htmlFor="title">Stream Title</Label>

                    <Field
                      type="text"
                      id="title"
                      name="title"
                      placeholder="Type your stream title"
                      render={({ field, form, ...props }) => (
                        <Input {...field} {...props} />
                      )}
                    />

                    <ErrorMessage name="title" />
                  </Fieldset>
                </Column>
              </Row>

              <Row>
                <Column />
                <Column span={11}>
                  <Fieldset>
                    <Legend>Category</Legend>

                    {this.renderCategories(
                      values.category_id && parseInt(values.category_id, 10)
                    )}
                    <ErrorMessage name="category_id" />
                  </Fieldset>
                </Column>
              </Row>

              <Row>
                <Column />
                <Column span={10}>
                  <Fieldset>
                    <Legend>Poster image</Legend>

                    <input
                      type="file"
                      id="poster_path"
                      name="poster_path"
                      css={`
                        ${hideVisually()}
                      `}
                      onChange={ev =>
                        ev.currentTarget.files &&
                        setFieldValue(
                          "poster_path",
                          URL.createObjectURL(ev.currentTarget.files[0])
                        )
                      }
                    />

                    <PosterLabel
                      posterUrl={values.poster_path}
                      htmlFor="poster_path"
                    >
                      <span
                        css={css`
                          background: ${props => props.theme.colors.primary};
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
                      <P translucent>
                        {values.poster_path ? "Change" : "Upload"} image
                      </P>
                      <P translucent>(1080x720)</P>
                    </PosterLabel>

                    <ErrorMessage name="poster_path" />
                  </Fieldset>
                </Column>
              </Row>

              <Row>
                <Column />
                <Column span={10}>
                  <Button type="submit" disabled={isSubmitting}>
                    Start Streaming
                  </Button>
                </Column>
              </Row>
            </form>
          )}
        </Formik>
      </Container>
    );
  }

  private renderCategories = (selectedCategory?: number) => (
    <CategoriesContainer>
      {[
        { id: 1, label: "Soccer" },
        { id: 2, label: "Gaming" },
        { id: 3, label: "Basketball" },
        { id: 4, label: "Basketball" }
      ].map(category => (
        <CategoryLabel key={category.id} htmlFor={`category-${category.id}`}>
          <Field
            type="radio"
            name="category_id"
            css={`
              ${hideVisually()}
            `}
            id={`category-${category.id}`}
            value={category.id}
          />

          <HighlightableIcon checked={selectedCategory === category.id}>
            <SoccerBallIcon width="60px" />
          </HighlightableIcon>

          <P translucent={selectedCategory !== category.id}>{category.label}</P>
        </CategoryLabel>
      ))}
    </CategoriesContainer>
  );
}
