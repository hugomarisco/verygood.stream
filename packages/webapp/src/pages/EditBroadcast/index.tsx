import {
  base64UrlUnescape,
  SwarmMetadata,
  ChunkAddressingMethod,
  ContentIntegrityProtectionMethod,
  LiveSignatureAlgorithm
} from "@bitstreamy/commons";
import { ErrorMessage, Field, Formik } from "formik";
import { inject, observer } from "mobx-react";
import { hideVisually } from "polished";
import React from "react";
import { Redirect, RouteComponentProps } from "react-router";
import { Button } from "../../components/Button";
import { Column } from "../../components/Column";
import { Container } from "../../components/Container";
import { Fieldset } from "../../components/Fieldset";
import { SoccerBallIcon } from "../../components/Icon";
import { Input } from "../../components/Input";
import { Label } from "../../components/Label";
import { Legend } from "../../components/Legend";
import { P } from "../../components/P";
import { Row } from "../../components/Row";
import { TopNav } from "../../components/TopNav";
import { ViewportContext } from "../../components/ViewportProvider";
import { EditBroadcastStore } from "../../stores/EditBroadcastStore";
import {
  CategoriesContainer,
  CategoryLabel,
  HighlightableIcon,
  PageTitle
} from "./styles";

interface IEditBroadcastRouteParams {
  swarmId: string;
}

interface IEditBroadcastProps
  extends RouteComponentProps<IEditBroadcastRouteParams> {
  editBroadcastStore: EditBroadcastStore;
}

@inject("editBroadcastStore")
@observer
export class EditBroadcast extends React.Component<IEditBroadcastProps> {
  public static contextType = ViewportContext;
  public context!: React.ContextType<typeof ViewportContext>;

  private swarmMetadata: SwarmMetadata;
  private queryParams: URLSearchParams;

  constructor(props: IEditBroadcastProps) {
    super(props);

    this.queryParams = new URLSearchParams(props.location.search);

    this.swarmMetadata = SwarmMetadata.fromSearchParams(this.queryParams);
  }

  public componentDidMount() {
    const { editBroadcastStore } = this.props;

    const swarmId = this.queryParams.get("swarmId");

    if (swarmId) {
      editBroadcastStore.fetch(swarmId);
    }
  }

  public render() {
    const { editBroadcastStore } = this.props;

    const { isFetching, isSaved, broadcast } = editBroadcastStore;

    if (isFetching || !broadcast) {
      return null;
    }

    if (isSaved) {
      return <Redirect to={`/b/${broadcast.broadcastId}`} />;
    }

    const { broadcastId, categoryId, title } = broadcast;

    const {
      chunkSize,
      chunkAddressingMethod,
      contentIntegrityProtectionMethod,
      liveSignatureAlgorithm
    } = this.swarmMetadata;

    return (
      <Container>
        <TopNav />

        <Row>
          <Column />
          <Column span={[10]}>
            <PageTitle>
              CUSTOMIZE
              <br />
              YOUR BROADCAST
            </PageTitle>
          </Column>
        </Row>

        <Formik
          enableReinitialize
          initialValues={{
            broadcastId,
            categoryId,
            chunkAddressingMethod,
            chunkSize,
            contentIntegrityProtectionMethod,
            liveSignatureAlgorithm,
            swarmId: this.queryParams.get("swarmId") || '',
            title
          }}
          onSubmit={async (values, { setSubmitting }) => {
            await this.props.editBroadcastStore.save(values);

            setSubmitting(false);
          }}
        >
          {({ handleSubmit, isSubmitting, values }) => (
            <form onSubmit={handleSubmit}>
              <Row>
                <Column />
                <Column span={[10]}>
                  <Fieldset>
                    <Label htmlFor="title">Title</Label>

                    <Field
                      type="text"
                      id="title"
                      name="title"
                      placeholder="Type your broadcast title"
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
                <Column span={[11]}>
                  <Fieldset>
                    <Legend>Category</Legend>

                    {this.renderCategories(values.categoryId)}

                    <ErrorMessage name="categoryId" />
                  </Fieldset>
                </Column>
              </Row>

              <Row>
                <Column />
                <Column span={[10]}>
                  <Button type="submit" disabled={isSubmitting}>
                    Start Broadcasting
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
        { categoryId: 1, label: "Soccer" },
        { categoryId: 2, label: "Gaming" },
        { categoryId: 3, label: "Basketball" },
        { categoryId: 4, label: "Basketball" }
      ].map(({ categoryId, label }) => (
        <CategoryLabel key={categoryId} htmlFor={`category-${categoryId}`}>
          <Field
            type="radio"
            name="categoryId"
            css={hideVisually()}
            id={`category-${categoryId}`}
            value={categoryId}
          />

          <HighlightableIcon checked={selectedCategory === categoryId}>
            <SoccerBallIcon width="60px" />
          </HighlightableIcon>

          <P translucent={selectedCategory !== categoryId}>{label}</P>
        </CategoryLabel>
      ))}
    </CategoriesContainer>
  );
}
