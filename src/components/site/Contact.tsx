import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Loader2, Send } from "lucide-react";
import { z } from "zod";
import emailjs from "@emailjs/browser";
import { SectionHeading } from "./SectionHeading";
import { publicSubmitBrief } from "@/lib/admin.functions";
import { useSetting } from "@/lib/site-data";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  company: z.string().trim().max(80).optional(),
  email: z.string().trim().email("Enter a valid email").max(160),
  phone: z.string().trim().min(6, "Include country code, e.g. +91 98765 43210").max(30),
  deadline: z.string().min(1, "Pick a deadline"),
  videoType: z.string().min(1, "Select a video type"),
  reference: z
    .string()
    .trim()
    .max(300)
    .refine((v) => v === "" || /^https?:\/\/\S+$/.test(v), "Enter a valid URL")
    .optional(),
  description: z.string().trim().min(20, "Tell me a bit more (20+ characters)").max(1500),
});

type Values = z.infer<typeof schema>;
type Errors = Partial<Record<keyof Values, string>>;

const initial: Values = {
  name: "",
  company: "",
  email: "",
  phone: "",
  deadline: "",
  videoType: "",
  reference: "",
  description: "",
};

const steps: { title: string; fields: (keyof Values)[] }[] = [
  { title: "About you", fields: ["name", "company", "email", "phone"] },
  { title: "The project", fields: ["deadline", "videoType"] },
  { title: "The details", fields: ["reference", "description"] },
];

const field =
  "w-full rounded-2xl border border-border bg-white/[0.03] px-5 py-4 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-all duration-300 focus:border-[#016764] focus:bg-white/[0.06] focus:ring-4 focus:ring-[#016764]/25";

const RECIPIENT = "jhayug29@gmail.com";

export function Contact() {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const formRef = useRef<HTMLFormElement>(null);
  const heading = useSetting("contact_title", "Let's make your next video the one people finish.");
  const sub = useSetting(
    "contact_subtitle",
    "Tell me about the project. I reply within 24 hours with a plan, a price and a timeline.",
  );

  const set = (k: keyof Values, v: string) => {
    setValues((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const validateStep = (i: number) => {
    const result = schema.safeParse(values);
    if (result.success) return true;
    const next: Errors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof Values;
      if (steps[i]!.fields.includes(key)) next[key] = issue.message;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateStep(2)) return;
    setStatus("sending");

    const serviceId = (import.meta.env["VITE_EMAILJS_SERVICE_ID"] as string | undefined) || "";
    const templateId = (import.meta.env["VITE_EMAILJS_TEMPLATE_ID"] as string | undefined) || "";
    const publicKey = (import.meta.env["VITE_EMAILJS_PUBLIC_KEY"] as string | undefined) || "";

    const safeValue = (value?: string) => {
      return value && String(value).trim() ? String(value).trim() : "Not provided";
    };

    try {
      // Register brief directly into server-side CMS store & Supabase
      await publicSubmitBrief({
        data: {
          name: values.name,
          company: values.company || "",
          email: values.email,
          phone: values.phone,
          deadline: values.deadline,
          video_type: values.videoType,
          reference: values.reference || "",
          description: values.description,
        },
      });

      const templateParams = {
        name: safeValue(values.name),
        company: safeValue(values.company),
        email: safeValue(values.email),
        phone: safeValue(values.phone),
        deadline: safeValue(values.deadline),
        video_type: safeValue(values.videoType),
        reference: safeValue(values.reference),
        description: safeValue(values.description),
        to_email: RECIPIENT,
        title: "New project brief",
      };

      await emailjs.send(serviceId, templateId, templateParams, { publicKey });

      setStatus("sent");
    } catch (err) {
      console.error("EmailJS submission failed:", err);
      setStatus("error");
    }
  };

  return (
    <section id="contact" className="relative py-28 sm:py-40">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[32rem] bg-[radial-gradient(ellipse_at_bottom,rgba(1,103,100,0.45),transparent_65%)]"
      />
      <div className="relative mx-auto max-w-3xl px-6">
        <SectionHeading eyebrow="Contact" title={heading} subtitle={sub} align="center" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="glass glow-teal mt-14 rounded-[32px] p-7 sm:p-10"
        >
          {status === "sent" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-14 text-center"
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 14 }}
                className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#016764] text-white shadow-[0_20px_60px_-16px_rgba(1,103,100,1)] ring-4 ring-[#7ef0e2]/20"
              >
                <Check className="h-10 w-10 stroke-[2.5]" />
              </motion.span>
              <h3 className="mt-8 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Thanks for reaching out
              </h3>
              <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-white/80">
                Thanks for reaching out; your form will be reviewed within 24 hours, and you will
                receive a message via email or WhatsApp.
              </p>
            </motion.div>
          ) : (
            <form ref={formRef} onSubmit={onSubmit} noValidate>
              <input type="hidden" name="to_email" value={RECIPIENT} readOnly />
              <input type="hidden" name="title" value="New project brief" readOnly />
              <div className="mb-9 flex items-center gap-3">
                {steps.map((s, i) => (
                  <div key={s.title} className="flex-1">
                    <div className="h-1 overflow-hidden rounded-full bg-white/8">
                      <motion.div
                        animate={{ width: i <= step ? "100%" : "0%" }}
                        transition={{ duration: 0.5 }}
                        className="h-full rounded-full bg-gradient-to-r from-[#016764] to-[#7ef0e2]"
                      />
                    </div>
                    <span
                      className={`mt-2.5 block text-[11px] tracking-wide ${i === step ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {s.title}
                    </span>
                  </div>
                ))}
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.32 }}
                  className="space-y-4"
                >
                  {step === 0 && (
                    <>
                      <Input
                        name="name"
                        label="Name"
                        value={values.name}
                        error={errors.name}
                        onChange={set}
                        placeholder="Your full name"
                      />
                      <Input
                        name="company"
                        label="Company (optional)"
                        value={values.company ?? ""}
                        onChange={set}
                        placeholder="Brand or channel"
                      />
                      <Input
                        name="email"
                        type="email"
                        label="Email"
                        value={values.email}
                        error={errors.email}
                        onChange={set}
                        placeholder="you@company.com"
                      />
                      <Input
                        name="phone"
                        label="Phone (with country code)"
                        value={values.phone}
                        error={errors.phone}
                        onChange={set}
                        placeholder="+91 98765 43210"
                      />
                    </>
                  )}

                  {step === 1 && (
                    <>
                      <Select
                        name="deadline"
                        label="Deadline"
                        value={values.deadline}
                        error={errors.deadline}
                        onChange={set}
                        options={[
                          "ASAP (24–48h)",
                          "This week",
                          "Within 2 weeks",
                          "This month",
                          "Flexible",
                        ]}
                      />
                      <Select
                        name="videoType"
                        label="Video type"
                        value={values.videoType}
                        error={errors.videoType}
                        onChange={set}
                        options={[
                          "Short form / Reels",
                          "VSL",
                          "YouTube long form",
                          "Documentary",
                          "Podcast",
                          "UGC ad",
                          "Motion graphics",
                        ]}
                      />
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <Input
                        name="reference"
                        label="Reference link (optional)"
                        value={values.reference ?? ""}
                        error={errors.reference}
                        onChange={set}
                        placeholder="https://youtube.com/..."
                      />
                      <div>
                        <label className="mb-2 block text-xs tracking-wide text-muted-foreground">
                          Project description
                        </label>
                        <textarea
                          name="description"
                          rows={5}
                          value={values.description}
                          onChange={(e) => set("description", e.target.value)}
                          placeholder="Goal, audience, footage you have, style you like…"
                          className={`${field} resize-none`}
                        />
                        {errors.description && (
                          <p className="mt-2 text-xs text-destructive">{errors.description}</p>
                        )}
                      </div>
                      {status === "error" && (
                        <p className="text-xs text-destructive">
                          Something went wrong sending your brief. Please email me directly at{" "}
                          {RECIPIENT}.
                        </p>
                      )}
                    </>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="mt-9 flex items-center justify-between gap-3">
                <motion.button
                  type="button"
                  whileHover={{ scale: step === 0 ? 1 : 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  disabled={step === 0}
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  className="glass inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm text-muted-foreground disabled:opacity-30"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </motion.button>

                {step < 2 ? (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => validateStep(step) && setStep((s) => s + 1)}
                    className="btn-radial inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium"
                  >
                    Continue <ArrowRight className="h-4 w-4" />
                  </motion.button>
                ) : (
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    disabled={status === "sending"}
                    className="btn-radial button-soft-glow inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium disabled:opacity-70"
                  >
                    {status === "sending" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Sending
                      </>
                    ) : (
                      <>
                        Send brief <Send className="h-4 w-4" />
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function Input({
  name,
  label,
  value,
  error,
  onChange,
  placeholder,
  type = "text",
}: {
  name: keyof Values;
  label: string;
  value: string;
  error?: string | undefined;
  onChange: (k: keyof Values, v: string) => void;
  placeholder?: string | undefined;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs tracking-wide text-muted-foreground">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(name, e.target.value)}
        className={field}
      />
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function Select({
  name,
  label,
  value,
  error,
  onChange,
  options,
}: {
  name: keyof Values;
  label: string;
  value: string;
  error?: string | undefined;
  onChange: (k: keyof Values, v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-2 block text-xs tracking-wide text-muted-foreground">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <motion.button
            key={o}
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(name, o)}
            className={`rounded-full border px-4 py-2.5 text-xs transition-all duration-300 ${
              value === o
                ? "border-transparent bg-primary text-primary-foreground shadow-[0_12px_36px_-14px_rgba(1,103,100,1)]"
                : "border-border text-muted-foreground hover:bg-white/5 hover:text-foreground"
            }`}
          >
            {o}
          </motion.button>
        ))}
      </div>
      <input type="hidden" name={name} value={value} readOnly />
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}
