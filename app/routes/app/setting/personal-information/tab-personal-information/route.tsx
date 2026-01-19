import { getFormProps, useForm, useInputControl } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Card, Button, Grid } from "@mantine/core";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { useEffect, useState } from "react";

import CompactCard from "~/components/card/compact-card";
import InputDate from "~/components/form/input-date";
import InputFileButton from "~/components/form/input-file-button";
import InputNumber from "~/components/form/input-number";
import InputSelect from "~/components/form/input-select";
import InputText from "~/components/form/input-text";

import { action, loader } from "../route";

import {
  genderOptions,
  personalInformationFormLabel,
  personalInformationFormSchema,
} from "./constants";
import PersonalInformationToc from "./personal-information-toc";
import SyncWithPeruriOrHisBanner from "./sync-with-peruri-or-his-banner";

function TabPersonalInformation() {
  const lastResult = useActionData<typeof action>();

  const data = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  const profile = data.data;

  const [form, fields] = useForm({
    lastResult,
    constraint: getZodConstraint(personalInformationFormSchema),
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    /* onSubmit(e) { */
    /*   e.preventDefault(); */
    /**/
    /*   const formData = new FormData(e.currentTarget); */
    /**/
    /*   const plain = Object.fromEntries(formData.entries()); */
    /*   console.log("Form values:", plain); */
    /* }, */
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: personalInformationFormSchema });
    },
    defaultValue: {
      name: profile?.name,
      gender: profile?.gender,
      medicalRecordNumber: profile?.medical_record_number,
      employeeNumber: profile?.employee_number,
      ktpNumber: profile?.nik,
      ktpFileId: profile?.ktp_file_id?.toString(),
      npwpNumber: profile?.npwp,
      npwpFileId: profile?.npwp_file_id?.toString(),
      phoneNumber: profile?.phone_number,
      email: profile?.email ?? "",
      address: profile?.address,
      city: profile?.city_id?.toString() ?? undefined,
      province: profile?.province_id?.toString() ?? undefined,
      placeOfBirth: profile?.place_of_birth,
      dateOfBirth: profile?.date_of_birth,
      organizationUnit: profile?.organization_unit,
      workUnit: profile?.work_unit,
      occupation: profile?.occupation,
      privileges: String(profile?.role_id),
    },
  });

  const city = useInputControl(fields.city);
  const privileges = useInputControl(fields.privileges);
  const province = useInputControl(fields.province);

  const [syncWithPeruri, setSyncWithPeruri] = useState<boolean>(
    profile?.sync_with_peruri ?? false,
  );

  const [readyToSync, setReadyToSync] = useState<boolean>(false);

  useEffect(() => {
    setSyncWithPeruri(profile?.sync_with_peruri ?? false);
  }, [profile?.sync_with_peruri]);

  useEffect(() => {
    const isComplete =
      fields.name?.value &&
      fields.gender?.value &&
      fields.placeOfBirth?.value &&
      fields.ktpNumber?.value &&
      fields.dateOfBirth?.value &&
      fields.phoneNumber?.value &&
      profile?.email &&
      fields.address?.value &&
      province.value &&
      city.value;

    setReadyToSync(Boolean(isComplete));
  }, [
    fields.name?.value,
    fields.gender?.value,
    fields.placeOfBirth?.value,
    fields.dateOfBirth?.value,
    fields.ktpNumber?.value,
    fields.phoneNumber?.value,
    profile?.email,
    fields.address?.value,
    province.value,
    city.value,
  ]);

  return (
    <Form method="POST" {...getFormProps(form)} encType="multipart/form-data">
      <CompactCard title="Informasi Pribadi">
        <Card.Section withBorder inheritPadding p="lg">
          <div className="flex gap-6">
            <div className="flex flex-col gap-3 flex-1">
              {/* banner sync with HIS and PERURI*/}
              <SyncWithPeruriOrHisBanner
                syncWithPeruriState={syncWithPeruri}
                readyToSync={readyToSync}
              />

              <CompactCard title="Informasi Pribadi" withBorder>
                <Card.Section withBorder inheritPadding p="lg">
                  <Grid>
                    <Grid.Col span={4}>
                      <InputText
                        {...personalInformationFormLabel["name"]}
                        fields={fields}
                      />
                    </Grid.Col>

                    <Grid.Col span={4}>
                      <InputSelect
                        {...personalInformationFormLabel["gender"]}
                        fields={fields}
                        data={genderOptions}
                      />
                    </Grid.Col>

                    <Grid.Col span={4}>
                      <InputText
                        {...personalInformationFormLabel["placeOfBirth"]}
                        fields={fields}
                      />
                    </Grid.Col>

                    <Grid.Col span={4}>
                      <InputDate
                        {...personalInformationFormLabel["dateOfBirth"]}
                        fields={fields}
                      />
                    </Grid.Col>

                    <Grid.Col span={4}>
                      <InputNumber
                        {...personalInformationFormLabel["medicalRecordNumber"]}
                        fields={fields}
                        allowLeadingZeros
                        allowNegative={false}
                        allowDecimal={false}
                        hideControls
                        trimLeadingZeroesOnBlur={false}
                        valueIsNumericString
                      />
                    </Grid.Col>

                    <Grid.Col span={4}>
                      <InputNumber
                        {...personalInformationFormLabel["employeeNumber"]}
                        fields={fields}
                        allowLeadingZeros
                        allowNegative={false}
                        allowDecimal={false}
                        hideControls
                        trimLeadingZeroesOnBlur={false}
                        valueIsNumericString
                      />
                    </Grid.Col>
                  </Grid>
                </Card.Section>
              </CompactCard>

              <CompactCard title="Informasi Pekerjaan" withBorder>
                <Card.Section withBorder inheritPadding p="lg">
                  <Grid>
                    <Grid.Col span={4}>
                      <div className="grid grid-cols-12 gap-x-2">
                        <InputNumber
                          className="col-span-7"
                          {...personalInformationFormLabel["ktpNumber"]}
                          fields={fields}
                          allowLeadingZeros
                          allowNegative={false}
                          allowDecimal={false}
                          hideControls
                          trimLeadingZeroesOnBlur={false}
                          valueIsNumericString
                        />

                        <div className="col-span-5">
                          <InputFileButton
                            emptyLabel={true}
                            {...personalInformationFormLabel["ktpFile"]}
                            dataKeys={{
                              path: "ktpFilePath",
                              id: "ktpFileId",
                            }}
                            fields={fields}
                          />
                        </div>
                      </div>
                    </Grid.Col>

                    <Grid.Col span={4}>
                      <div className="grid grid-cols-12 gap-2">
                        <InputNumber
                          className="col-span-7"
                          {...personalInformationFormLabel["npwpNumber"]}
                          fields={fields}
                          allowLeadingZeros
                          allowNegative={false}
                          allowDecimal={false}
                          hideControls
                          trimLeadingZeroesOnBlur={false}
                          valueIsNumericString
                        />
                        <div className="col-span-5">
                          <InputFileButton
                            emptyLabel={true}
                            {...personalInformationFormLabel["npwpFile"]}
                            dataKeys={{
                              path: "npwpFilePath",
                              id: "npwpFileId",
                            }}
                            fields={fields}
                          />
                        </div>
                      </div>
                    </Grid.Col>

                    <Grid.Col span={4}>
                      <InputText
                        {...personalInformationFormLabel["organizationUnit"]}
                        fields={fields}
                      />
                    </Grid.Col>

                    <Grid.Col span={4}>
                      <InputText
                        {...personalInformationFormLabel["workUnit"]}
                        fields={fields}
                      />
                    </Grid.Col>

                    <Grid.Col span={4}>
                      <InputText
                        {...personalInformationFormLabel["occupation"]}
                        fields={fields}
                      />
                    </Grid.Col>
                  </Grid>
                </Card.Section>
              </CompactCard>

              <CompactCard title="Hak Akses" withBorder>
                <Card.Section withBorder inheritPadding p="lg">
                  <Grid>
                    <Grid.Col span={4}>
                      <InputSelect
                        {...personalInformationFormLabel["privileges"]}
                        fields={fields}
                        value={privileges.value}
                        onChange={(value) => {
                          privileges.change(value ?? undefined);
                        }}
                        onFocus={privileges.focus}
                        selectFirstOptionOnChange={true}
                        onBlur={privileges.blur}
                        dataFetch={{
                          urlPath: "api/roles",
                          keys: { label: "name", value: "id" },
                          dataKeys: "data",
                        }}
                        allowDeselect
                        skipLimit={privileges.value ? true : false}
                      />
                    </Grid.Col>
                  </Grid>
                </Card.Section>
              </CompactCard>

              <CompactCard title="Kontak" withBorder>
                <Card.Section withBorder inheritPadding p="lg">
                  <Grid>
                    <Grid.Col span={4}>
                      <InputNumber
                        {...personalInformationFormLabel["phoneNumber"]}
                        fields={fields}
                        allowLeadingZeros
                        allowNegative={false}
                        allowDecimal={false}
                        hideControls
                        trimLeadingZeroesOnBlur={false}
                        valueIsNumericString
                      />
                    </Grid.Col>

                    <Grid.Col span={4}>
                      <InputText
                        {...personalInformationFormLabel["email"]}
                        disabled
                        fields={fields}
                      />
                    </Grid.Col>
                  </Grid>
                </Card.Section>
              </CompactCard>

              <CompactCard title="Alamat" withBorder>
                <Card.Section withBorder inheritPadding p="lg">
                  <Grid>
                    <Grid.Col span={4}>
                      <InputText
                        {...personalInformationFormLabel["address"]}
                        fields={fields}
                      />
                    </Grid.Col>

                    <Grid.Col span={4}>
                      <InputSelect
                        {...personalInformationFormLabel["province"]}
                        fields={fields}
                        value={province.value}
                        onChange={(value) => {
                          if (value !== province.value) {
                            province.change(value ?? undefined);
                            city.change("");
                            form.update({
                              name: fields.city.name,
                              value: "",
                            });
                          }
                        }}
                        onFocus={province.focus}
                        allowDeselect={false}
                        onBlur={province.blur}
                        dataFetch={{
                          urlPath: "api/province",
                          keys: { label: "name", value: "id" },
                          dataKeys: "data",
                        }}
                        skipLimit={province.value ? true : false}
                      />
                    </Grid.Col>

                    <Grid.Col span={4}>
                      <InputSelect
                        {...personalInformationFormLabel["city"]}
                        remountKey={province.value}
                        fields={fields}
                        value={city.value}
                        onChange={(value) => {
                          city.change(value ?? undefined);
                        }}
                        onFocus={city.focus}
                        selectFirstOptionOnChange={true}
                        onBlur={city.blur}
                        dataFetch={{
                          urlPath: "api/city",
                          keys: { label: "name", value: "id" },
                          dataKeys: "data",
                          params: {
                            f_province: province.value,
                          },
                        }}
                        allowDeselect
                        disabled={province.value === undefined}
                        skipLimit={city.value ? true : false}
                      />
                    </Grid.Col>
                  </Grid>
                </Card.Section>
              </CompactCard>
            </div>

            {/* right pannel TOC */}
            <div className="w-1/5">
              <PersonalInformationToc />
            </div>
          </div>
        </Card.Section>

        <Card.Section p="lg" className="flex justify-end gap-4">
          <Button
            type="submit"
            leftSection={
              <Icon icon="tabler:device-floppy" className="h-4 w-4" />
            }
            className="font-normal"
            // disabled={syncWithPeruri}
            loading={navigation.state !== "idle"}
          >
            Simpan
          </Button>
        </Card.Section>
      </CompactCard>
    </Form>
  );
}

export default TabPersonalInformation;
