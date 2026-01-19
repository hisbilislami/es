import {
  FormProvider,
  getFormProps,
  useForm,
  useInputControl,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Button } from "@mantine/core";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";

import AppCardForm from "~/components/card/app-card-form";
import CompactCard from "~/components/card/compact-card";
import InputDate from "~/components/form/input-date";
import InputNumber from "~/components/form/input-number";
import InputSelect from "~/components/form/input-select";
import InputText from "~/components/form/input-text";

import { actionHandler } from "./action";
import UserSignerIdentity from "./identity/route";
import { loaderHandler } from "./loader";
import { addressLabel } from "./schema/address.schema";
import { organizationLabel } from "./schema/organization.schema";
import {
  formLabel,
  genderOptions,
  personalInformationSchema,
  userSignerTypeOptions,
} from "./schema/personal-information.schema";

export const action = ({ request }: ActionFunctionArgs) => {
  return actionHandler(request);
};

export const loader = ({ request }: LoaderFunctionArgs) => {
  return loaderHandler(request);
};

const UserSignerFormPage = () => {
  const lastResult = useActionData<typeof action>();

  const data = useLoaderData<typeof loader>();

  const userSigner = data?.data;

  const navigation = useNavigation();
  const navigate = useNavigate();

  const [form, fields] = useForm({
    id: "user-signer-form",
    lastResult,
    constraint: getZodConstraint(personalInformationSchema),
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onValidate({ formData }) {
      const validate = parseWithZod(formData, {
        schema: personalInformationSchema,
      });
      return validate;
    },
    defaultValue: {
      id: userSigner?.id,
      name: userSigner?.name,
      gender: userSigner?.gender,
      place_of_birth: userSigner?.place_of_birth,
      date_of_birth: userSigner?.date_of_birth?.toISOString() ?? null,
      type: userSigner?.type,
      medical_record_number: userSigner?.medical_record_number,
      email: userSigner?.email,
      phone: userSigner?.phone_number,
      address: userSigner?.address,
      postal_code: userSigner?.subdistrict?.postal_code,
      subdistrict: userSigner?.subdistrict_id?.toString(),
      district: userSigner?.subdistrict?.district.id.toString(),
      city: userSigner?.subdistrict?.district.city.id.toString(),
      province: userSigner?.subdistrict?.district.city.province.id.toString(),
      country:
        userSigner?.subdistrict?.district?.city?.province?.country?.id.toString(),
      company_employee_id:
        userSigner?.company_employee && userSigner?.company_employee.length > 0
          ? userSigner?.company_employee[0].id
          : null,
      company:
        userSigner?.company_employee && userSigner?.company_employee.length > 0
          ? userSigner?.company_employee[0].company.id.toString()
          : null,
      working_unit:
        userSigner?.company_employee && userSigner?.company_employee.length > 0
          ? userSigner?.company_employee[0].working_unit_id.toString()
          : null,
      job_position:
        userSigner?.company_employee && userSigner?.company_employee.length > 0
          ? userSigner?.company_employee[0].job_position_id.toString()
          : null,
      practitioner_number:
        userSigner?.company_employee && userSigner?.company_employee.length > 0
          ? userSigner?.company_employee[0].practitioner_number
          : null,
      employee_number:
        userSigner?.company_employee && userSigner?.company_employee.length > 0
          ? userSigner?.company_employee[0].employee_number
          : null,
      identities:
        userSigner?.person_identity?.map((pi) => ({
          id: pi.id,
          number: pi.number,
          issuer: pi.issuer,
          expired_date: pi.expired_date ? pi.expired_date.toISOString() : null,
          identity_type: pi.identity_id ? String(pi.identity_id) : null,
          identity_type_name: pi.identity?.name ?? null,
          country_issuer: pi.country_id ? String(pi.country_id) : null,
          country_issuer_name: pi.issuer_country?.name ?? null,
          file_identity: undefined,
          file_identity_id: pi.file_identity_id
            ? String(pi.file_identity_id)
            : null,
          file_identity_name: pi.file_identity?.origin_name
            ? String(pi.file_identity.origin_name)
            : null,
          file_identity_url: pi.file_identity?.url
            ? String(pi.file_identity.url)
            : null,
          primary: pi.primary === true ? "y" : "n",
        })) ?? [],
    },
  });

  const country = useInputControl(fields.country);
  const province = useInputControl(fields.province);
  const city = useInputControl(fields.city);
  const district = useInputControl(fields.district);
  const subDistrict = useInputControl(fields.subdistrict);

  const company = useInputControl(fields.company);
  const workingUnit = useInputControl(fields.working_unit);
  const jobPosition = useInputControl(fields.job_position);

  return (
    <>
      <FormProvider context={form.context}>
        <Form
          method="POST"
          {...getFormProps(form)}
          action="/app/setting/user-signer/manage"
          encType="multipart/form-data"
        />
        <AppCardForm
          isForm={true}
          title="Form User Signer"
          actionButtons={
            <div className="inlin-flex gap-3">
              <Button
                type="button"
                size="xs"
                leftSection={<Icon icon="tabler:x" className="h-5 w-5" />}
                variant="default"
                onClick={() => navigate("/app/setting/user-signer")}
                loading={navigation.state !== "idle"}
              >
                Batal
              </Button>
              <Button
                type="submit"
                form={form.id}
                size="xs"
                leftSection={
                  <Icon icon="tabler:device-floppy" className="h-5 w-5" />
                }
                color="tmBlue"
                loading={navigation.state !== "idle"}
              >
                Simpan
              </Button>
            </div>
          }
        >
          <div className="flex flex-col p-3 gap-3">
            <CompactCard title="Informasi Pribadi" withBorder>
              <div className="grid grid-cols-2">
                <div className="p-5">
                  <input
                    type="hidden"
                    name={fields.id.name}
                    value={fields.id.value}
                    form={form.id}
                  />
                  <InputText fields={fields} {...formLabel["name"]} />
                  <InputSelect
                    {...formLabel["gender"]}
                    fields={fields}
                    data={genderOptions}
                  />
                  <InputText fields={fields} {...formLabel["place_of_birth"]} />
                  <InputDate fields={fields} {...formLabel["date_of_birth"]} />
                </div>
                <div className="p-5">
                  <InputSelect
                    {...formLabel["type"]}
                    fields={fields}
                    data={userSignerTypeOptions}
                  />
                  <InputText
                    fields={fields}
                    {...formLabel["medical_record_number"]}
                  />
                  <InputText fields={fields} {...formLabel["email"]} />
                  <InputNumber
                    hideControls
                    allowLeadingZeros
                    trimLeadingZeroesOnBlur={false}
                    fields={fields}
                    {...formLabel["phone"]}
                  />
                </div>
              </div>
            </CompactCard>
            <CompactCard title="Identitas" withBorder>
              <UserSignerIdentity />
            </CompactCard>
            <CompactCard title="Alamat" withBorder>
              <div className="grid grid-cols-2">
                <div className="p-5">
                  <InputText fields={fields} {...addressLabel["address"]} />
                  <InputSelect
                    {...addressLabel["country"]}
                    remountKey={country.value}
                    fields={fields}
                    searchable={true}
                    value={country.value}
                    onFocus={country.focus}
                    onChange={(value) => {
                      country.change(value ?? undefined);
                    }}
                    selectFirstOptionOnChange={true}
                    onBlur={() => {
                      return country.blur;
                    }}
                    dataFetch={{
                      urlPath: "api/country",
                      keys: { label: "name", value: "id" },
                      dataKeys: "data",
                    }}
                    allowDeselect
                    skipLimit={country.value ? true : false}
                  />
                  <InputSelect
                    {...addressLabel["province"]}
                    remountKey={province.value}
                    fields={fields}
                    searchable={true}
                    value={province.value}
                    onChange={(value) => {
                      province.change(value ?? undefined);
                    }}
                    onFocus={province.focus}
                    selectFirstOptionOnChange={true}
                    onBlur={() => {
                      return province.blur;
                    }}
                    dataFetch={{
                      urlPath: "api/province",
                      keys: { label: "name", value: "id" },
                      dataKeys: "data",
                      params: {
                        f_country: country.value || undefined,
                      },
                    }}
                    allowDeselect
                    skipLimit={province.value ? true : false}
                  />
                </div>
                <div className="p-5">
                  <InputSelect
                    {...addressLabel["city"]}
                    remountKey={city.value}
                    fields={fields}
                    searchable={true}
                    onChange={(value) => {
                      city.change(value ?? undefined);
                    }}
                    value={city.value}
                    onFocus={city.focus}
                    selectFirstOptionOnChange={true}
                    onBlur={() => {
                      return city.blur;
                    }}
                    dataFetch={{
                      urlPath: "api/city",
                      keys: { label: "name", value: "id" },
                      dataKeys: "data",
                      params: {
                        f_province: province.value,
                      },
                    }}
                    allowDeselect
                    skipLimit={city.value ? true : false}
                  />
                  <InputSelect
                    {...addressLabel["district"]}
                    remountKey={district.value}
                    fields={fields}
                    searchable={true}
                    value={district.value}
                    onFocus={district.focus}
                    onChange={(value) => {
                      district.change(value ?? undefined);
                    }}
                    selectFirstOptionOnChange={true}
                    onBlur={() => {
                      return district.blur;
                    }}
                    dataFetch={{
                      urlPath: "api/district",
                      keys: { label: "name", value: "id" },
                      dataKeys: "data",
                      params: {
                        f_city: city.value,
                      },
                    }}
                    allowDeselect
                    skipLimit={district.value ? true : false}
                  />
                  <InputSelect
                    {...addressLabel["subdistrict"]}
                    remountKey={subDistrict.value}
                    fields={fields}
                    searchable={true}
                    onChange={(value, opt) => {
                      const selected = opt as typeof opt & {
                        originalData?: {
                          postal_code?: string;
                        };
                      };
                      subDistrict.change(value ?? undefined);
                      if (selected.originalData?.postal_code) {
                        form.update({
                          name: fields.postal_code.name,
                          value: selected.originalData.postal_code,
                        });
                      }
                    }}
                    value={subDistrict.value}
                    onFocus={subDistrict.focus}
                    selectFirstOptionOnChange={true}
                    onBlur={() => {
                      return subDistrict.blur;
                    }}
                    dataFetch={{
                      urlPath: "api/subdistrict",
                      keys: { label: "name", value: "id" },
                      dataKeys: "data",
                      params: {
                        f_district: district.value,
                      },
                    }}
                    allowDeselect
                    skipLimit={subDistrict.value ? true : false}
                  />
                  <InputNumber
                    fields={fields}
                    hideControls
                    readOnly
                    {...addressLabel["postal_code"]}
                  />
                </div>
              </div>
            </CompactCard>
            {form.getFieldset().type.value === "employee" && (
              <CompactCard title="Organisasi" withBorder>
                <div className="grid grid-cols-2">
                  <div className="p-5">
                    <input
                      type="hidden"
                      name={fields.company_employee_id.name}
                      value={fields.company_employee_id.value}
                      form={form.id}
                    />
                    <InputSelect
                      {...organizationLabel["company"]}
                      remountKey={company.value}
                      fields={fields}
                      searchable={true}
                      onChange={(value) => {
                        company.change(value ?? undefined);
                      }}
                      value={company.value}
                      onFocus={company.focus}
                      selectFirstOptionOnChange={true}
                      onBlur={() => {
                        return company.blur;
                      }}
                      dataFetch={{
                        urlPath: "api/company",
                        keys: { label: "name", value: "id" },
                        dataKeys: "data",
                      }}
                      allowDeselect
                      skipLimit={company.value ? true : false}
                    />
                    <InputSelect
                      {...organizationLabel["working_unit"]}
                      remountKey={workingUnit.value}
                      fields={fields}
                      searchable={true}
                      onChange={(value) => {
                        workingUnit.change(value ?? undefined);
                      }}
                      value={workingUnit.value}
                      onFocus={workingUnit.focus}
                      selectFirstOptionOnChange={true}
                      onBlur={() => {
                        return workingUnit.blur;
                      }}
                      dataFetch={{
                        urlPath: "api/working-unit",
                        keys: { label: "name", value: "id" },
                        dataKeys: "data",
                      }}
                      allowDeselect
                      skipLimit={workingUnit.value ? true : false}
                    />
                    <InputSelect
                      {...organizationLabel["job_position"]}
                      remountKey={jobPosition.value}
                      fields={fields}
                      searchable={true}
                      onChange={(value) => {
                        jobPosition.change(value ?? undefined);
                      }}
                      value={jobPosition.value}
                      onFocus={jobPosition.focus}
                      selectFirstOptionOnChange={true}
                      onBlur={() => {
                        return jobPosition.blur;
                      }}
                      dataFetch={{
                        urlPath: "api/job-position",
                        keys: { label: "name", value: "id" },
                        dataKeys: "data",
                      }}
                      allowDeselect
                      skipLimit={jobPosition.value ? true : false}
                    />
                  </div>
                  <div className="p-5">
                    <InputNumber
                      fields={fields}
                      {...organizationLabel["practitioner_number"]}
                      hideControls
                    />
                    <InputNumber
                      fields={fields}
                      {...organizationLabel["employee_number"]}
                      hideControls
                    />
                  </div>
                </div>
              </CompactCard>
            )}
          </div>
        </AppCardForm>
      </FormProvider>
    </>
  );
};

export default UserSignerFormPage;
